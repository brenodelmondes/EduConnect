using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/inscricoes")]
    public class InscricoesController : ControllerBase
    {
        private static readonly ConcurrentDictionary<string, InscricaoState> _state = new();
        private static readonly ConcurrentDictionary<string, int> _turmaCounters = new();
        private readonly IConfiguration _configuration;
        private readonly ILogger<InscricoesController> _logger;
        private readonly IHostEnvironment _environment;
        private readonly AppDbContext _dbContext;

        public InscricoesController(
            IConfiguration configuration,
            ILogger<InscricoesController> logger,
            IHostEnvironment environment,
            AppDbContext dbContext)
        {
            _configuration = configuration;
            _logger = logger;
            _environment = environment;
            _dbContext = dbContext;

            var smtpSectionExists = _configuration.GetSection("Smtp").Exists();
            _logger.LogInformation(
                "InscricoesController iniciado. Environment={Environment}. SmtpSectionExists={SmtpSectionExists}.",
                _environment.EnvironmentName,
                smtpSectionExists);
        }

        [AllowAnonymous]
        [HttpPost]
        [ProducesResponseType(typeof(InscricaoResponse), 200)]
        [ProducesResponseType(400)]
        public IActionResult Criar([FromBody] InscricaoRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var correlationId = Guid.NewGuid().ToString("N");

            var inscricao = new InscricaoState
            {
                CorrelationId = correlationId,
                Status = "PENDENTE",
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                Phone = request.Phone.Trim(),
                Course = request.Course.Trim(),
                EmailTemplate = string.IsNullOrWhiteSpace(request.EmailTemplate) ? "DEFAULT" : request.EmailTemplate.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _state[correlationId] = inscricao;

            return Ok(ToResponse(inscricao));
        }

        [AllowAnonymous]
        [HttpGet("{correlationId}/status")]
        [ProducesResponseType(typeof(InscricaoResponse), 200)]
        [ProducesResponseType(404)]
        public IActionResult ObterStatus(string correlationId)
        {
            if (!_state.TryGetValue(correlationId, out var state))
            {
                return NotFound("Inscrição não encontrada.");
            }

            return Ok(ToResponse(state));
        }

        [Authorize(Roles = "Administrador")]
        [HttpGet("pendentes")]
        [ProducesResponseType(typeof(IEnumerable<InscricaoResponse>), 200)]
        public IActionResult ListarPendentes()
        {
            var pendentes = _state.Values
                .Where(item => item.Status == "PENDENTE")
                .OrderBy(item => item.CreatedAt)
                .Select(ToResponse)
                .ToList();

            return Ok(pendentes);
        }

        [Authorize(Roles = "Administrador")]
        [HttpGet("processadas")]
        [ProducesResponseType(typeof(IEnumerable<InscricaoResponse>), 200)]
        public IActionResult ListarProcessadas([FromQuery] string? status)
        {
            var statusNormalized = string.IsNullOrWhiteSpace(status)
                ? null
                : status.Trim().ToUpperInvariant();

            var processadas = _state.Values
                .Where(item => item.Status != "PENDENTE")
                .Where(item => statusNormalized == null || item.Status == statusNormalized)
                .OrderByDescending(item => item.ReviewedAt ?? item.CreatedAt)
                .Select(ToResponse)
                .ToList();

            return Ok(processadas);
        }

        [Authorize(Roles = "Administrador")]
        [HttpPost("{correlationId}/aprovar")]
        [ProducesResponseType(typeof(InscricaoResponse), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> Aprovar(string correlationId, [FromBody] AprovarInscricaoRequest? request)
        {
            if (!_state.TryGetValue(correlationId, out var state))
            {
                return NotFound("Inscrição não encontrada.");
            }

            if (state.Status != "PENDENTE")
            {
                return Conflict("Somente inscrições pendentes podem ser aprovadas.");
            }

            state.Status = "APROVADA";
            state.TurmaCodigo = ResolveTurmaCodigo(state.Course, request?.TurmaCodigo);
            state.FirstAccessReleased = true;
            state.TemporaryLogin = state.Email;
            state.TemporaryPassword = GenerateTemporaryPassword();
            state.ReviewedAt = DateTime.UtcNow;
            state.ReviewedBy = User?.Identity?.Name ?? "admin";

            var persistResult = await PersistApprovedEnrollmentAsync(state);
            if (!persistResult.Success)
            {
                state.Status = "PENDENTE";
                state.TurmaCodigo = null;
                state.FirstAccessReleased = false;
                state.TemporaryLogin = null;
                state.TemporaryPassword = null;
                state.ReviewedAt = null;
                state.ReviewedBy = null;
                state.EmailSent = false;
                state.EmailLastMessage = persistResult.Message;
                return Conflict(persistResult.Message);
            }

            var emailResult = TrySendFirstAccessEmail(state);
            state.LastSentAt = DateTime.UtcNow;
            state.EmailSent = emailResult.Success;
            state.EmailLastMessage = emailResult.Message;

            return Ok(ToResponse(state));
        }

        [Authorize(Roles = "Administrador")]
        [HttpPost("{correlationId}/reprovar")]
        [ProducesResponseType(typeof(InscricaoResponse), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public IActionResult Reprovar(string correlationId, [FromBody] ReprovarInscricaoRequest request)
        {
            if (!_state.TryGetValue(correlationId, out var state))
            {
                return NotFound("Inscrição não encontrada.");
            }

            if (state.Status != "PENDENTE")
            {
                return Conflict("Somente inscrições pendentes podem ser reprovadas.");
            }

            state.Status = "REPROVADA";
            state.Reason = string.IsNullOrWhiteSpace(request.Motivo) ? "Não informado" : request.Motivo.Trim();
            state.ReviewedAt = DateTime.UtcNow;
            state.ReviewedBy = User?.Identity?.Name ?? "admin";
            state.FirstAccessReleased = false;
            state.EmailSent = false;
            state.EmailLastMessage = "Inscrição reprovada. Nenhum e-mail de credenciais enviado.";

            return Ok(ToResponse(state));
        }

        [Authorize(Roles = "Administrador")]
        [HttpPost("{correlationId}/reenviar-email")]
        [ProducesResponseType(typeof(InscricaoResponse), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public IActionResult ReenviarEmail(string correlationId)
        {
            if (!_state.TryGetValue(correlationId, out var state))
            {
                return NotFound("Inscrição não encontrada.");
            }

            if (state.Status != "APROVADA" || !state.FirstAccessReleased)
            {
                return Conflict("Somente inscrições aprovadas podem reenviar e-mail de primeiro acesso.");
            }

            var emailResult = TrySendFirstAccessEmail(state);
            state.LastSentAt = DateTime.UtcNow;
            state.EmailSent = emailResult.Success;
            state.EmailLastMessage = emailResult.Message;

            return Ok(ToResponse(state));
        }

        private InscricaoResponse ToResponse(InscricaoState state) =>
            new()
            {
                Status = state.Status,
                CorrelationId = state.CorrelationId,
                FullName = state.FullName,
                Email = state.Email,
                Phone = state.Phone,
                Course = state.Course,
                TurmaCodigo = state.TurmaCodigo,
                FirstAccessReleased = state.FirstAccessReleased,
                EmailSent = state.EmailSent,
                TemporaryLogin = state.TemporaryLogin,
                TemporaryPassword = state.TemporaryPassword,
                Message = state.EmailLastMessage,
                CreatedAt = state.CreatedAt,
                ReviewedAt = state.ReviewedAt,
                ReviewedBy = state.ReviewedBy,
                Reason = state.Reason,
            };

        private static string GenerateTemporaryPassword()
        {
            var suffix = Guid.NewGuid().ToString("N")[..8];
            return $"Edu@{suffix}";
        }

        private static string ResolveTurmaCodigo(string course, string? requestTurmaCodigo)
        {
            if (!string.IsNullOrWhiteSpace(requestTurmaCodigo) &&
                !string.Equals(requestTurmaCodigo.Trim(), "STRING", StringComparison.OrdinalIgnoreCase))
            {
                return requestTurmaCodigo.Trim().ToUpperInvariant();
            }

            var courseKey = NormalizeCourseKey(course);
            var next = _turmaCounters.AddOrUpdate(courseKey, 1, (_, current) => current + 1);
            return $"{courseKey}{next}";
        }

        private static string NormalizeCourseKey(string? course)
        {
            var normalized = (course ?? string.Empty).Trim().ToUpperInvariant();
            return normalized switch
            {
                "ANÁLISE E DESENVOLVIMENTO DE SISTEMAS" => "ADS",
                "ANALISE E DESENVOLVIMENTO DE SISTEMAS" => "ADS",
                "ENGENHARIA DE SOFTWARE" => "SI",
                "ENG" => "SI",
                "SI" => "SI",
                "CCO" => "CCO",
                "ADS" => "ADS",
                _ => "ADS"
            };
        }

        private async Task<(bool Success, string Message)> PersistApprovedEnrollmentAsync(InscricaoState state)
        {
            var perfilAluno = await _dbContext.Perfis
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Nome == "Aluno");
            if (perfilAluno == null)
            {
                _logger.LogWarning("Perfil 'Aluno' nao encontrado na base.");
                return (false, "Perfil 'Aluno' nao encontrado.");
            }

            var courseKey = NormalizeCourseKey(state.Course);
            var courseName = ResolveCourseName(courseKey);
            var curso = await _dbContext.Cursos
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Nome.ToLower() == courseName.ToLower());
            if (curso == null)
            {
                curso = await _dbContext.Cursos
                    .AsNoTracking()
                    .OrderBy(c => c.Id)
                    .FirstOrDefaultAsync();

                if (curso == null)
                {
                    _logger.LogWarning("Nenhum curso cadastrado para aprovar inscricao.");
                    return (false, "Nenhum curso cadastrado no sistema.");
                }

                _logger.LogWarning(
                    "Curso nao encontrado para chave {CourseKey}. Usando fallback {CursoId}:{CursoNome}.",
                    courseKey,
                    curso.Id,
                    curso.Nome);
            }

            var usuario = await _dbContext.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == state.Email.ToLower());
            if (usuario == null)
            {
                var (nome, sobrenome) = SplitFullName(state.FullName);
                var cpf = await GenerateUniqueCpfAsync();

                usuario = new Usuario
                {
                    Nome = nome,
                    Sobrenome = sobrenome,
                    Email = state.Email,
                    Cpf = cpf,
                    PerfilId = perfilAluno.Id,
                    Senha = BCrypt.Net.BCrypt.HashPassword(state.TemporaryPassword)
                };

                _dbContext.Usuarios.Add(usuario);
                await _dbContext.SaveChangesAsync();
            }

            var aluno = await _dbContext.Alunos
                .FirstOrDefaultAsync(a => a.UsuarioId == usuario.Id);
            if (aluno == null)
            {
                var ra = await GenerateUniqueRaAsync();
                aluno = new Aluno
                {
                    UsuarioId = usuario.Id,
                    CursoId = curso.Id,
                    Ra = ra
                };
                _dbContext.Alunos.Add(aluno);
                await _dbContext.SaveChangesAsync();
            }
            else if (aluno.CursoId != curso.Id)
            {
                aluno.CursoId = curso.Id;
                _dbContext.Alunos.Update(aluno);
                await _dbContext.SaveChangesAsync();
            }

            var turma = await _dbContext.Turmas
                .Include(t => t.Materia)
                .FirstOrDefaultAsync(t => t.Materia.CursoId == curso.Id);
            if (turma == null)
            {
                turma = await _dbContext.Turmas
                    .Include(t => t.Materia)
                    .OrderBy(t => t.Id)
                    .FirstOrDefaultAsync();

                if (turma == null)
                {
                    _logger.LogWarning("Nenhuma turma cadastrada para aprovar inscricao.");
                    return (false, "Nenhuma turma cadastrada no sistema.");
                }

                _logger.LogWarning(
                    "Turma nao encontrada para curso {CursoId}. Usando fallback {TurmaId}.",
                    curso.Id,
                    turma.Id);
            }

            var matriculaExistente = await _dbContext.Matriculas
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.AlunoId == aluno.Id && m.TurmaId == turma.Id);
            if (matriculaExistente == null)
            {
                var matricula = new Matricula
                {
                    AlunoId = aluno.Id,
                    TurmaId = turma.Id
                };
                _dbContext.Matriculas.Add(matricula);
                await _dbContext.SaveChangesAsync();
            }

            return (true, "Usuario, aluno e matricula persistidos.");
        }

        private static string ResolveCourseName(string courseKey)
        {
            return courseKey switch
            {
                "ADS" => "Análise e Desenvolvimento de Sistemas",
                "CCO" => "Ciência da Computação",
                "SI" => "Sistemas de Informação",
                _ => "Análise e Desenvolvimento de Sistemas"
            };
        }

        private static (string Nome, string Sobrenome) SplitFullName(string fullName)
        {
            var parts = (fullName ?? string.Empty).Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0)
            {
                return ("Aluno", "EduConnect");
            }

            if (parts.Length == 1)
            {
                return (parts[0], "EduConnect");
            }

            return (parts[0], string.Join(' ', parts.Skip(1)));
        }

        private async Task<string> GenerateUniqueCpfAsync()
        {
            for (var attempt = 0; attempt < 5; attempt++)
            {
                var cpf = GenerateDigits(11);
                var exists = await _dbContext.Usuarios.AsNoTracking().AnyAsync(u => u.Cpf == cpf);
                if (!exists)
                {
                    return cpf;
                }
            }

            return DateTime.UtcNow.Ticks.ToString().PadLeft(11, '0')[..11];
        }

        private async Task<string> GenerateUniqueRaAsync()
        {
            for (var attempt = 0; attempt < 5; attempt++)
            {
                var ra = $"RA{GenerateDigits(8)}";
                var exists = await _dbContext.Alunos.AsNoTracking().AnyAsync(a => a.Ra == ra);
                if (!exists)
                {
                    return ra;
                }
            }

            var fallback = DateTime.UtcNow.Ticks.ToString().PadLeft(8, '0')[^8..];
            return $"RA{fallback}";
        }

        private static string GenerateDigits(int length)
        {
            var bytes = RandomNumberGenerator.GetBytes(length);
            var sb = new StringBuilder(length);
            foreach (var b in bytes)
            {
                sb.Append((b % 10).ToString());
            }
            return sb.ToString();
        }

        private (bool Success, string Message) TrySendFirstAccessEmail(InscricaoState state)
        {
            try
            {
                var smtpHost = _configuration["Smtp:Host"];
                var smtpPortText = _configuration["Smtp:Port"];
                var smtpUser = _configuration["Smtp:Username"];
                var smtpPassword = _configuration["Smtp:Password"];
                var smtpFromEmail = _configuration["Smtp:FromEmail"];
                var smtpFromName = _configuration["Smtp:FromName"] ?? "EduConnect";
                var appUrl = _configuration["Smtp:AppUrl"] ?? "http://localhost:5173/login";
                var enableSsl = !string.Equals(_configuration["Smtp:EnableSsl"], "false", StringComparison.OrdinalIgnoreCase);

                var body = BuildEmailBody(state, appUrl);

                _logger.LogInformation(
                    "SMTP config lida. Env={Environment} Host={Host} Port={Port} EnableSsl={EnableSsl} Username={Username} FromEmail={FromEmail} FromName={FromName} AppUrl={AppUrl}.",
                    _environment.EnvironmentName,
                    smtpHost,
                    smtpPortText,
                    enableSsl,
                    smtpUser,
                    smtpFromEmail,
                    smtpFromName,
                    appUrl);

                if (string.IsNullOrWhiteSpace(smtpFromEmail) && !string.IsNullOrWhiteSpace(smtpUser))
                {
                    smtpFromEmail = smtpUser;
                }

                if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(smtpFromEmail))
                {
                    _logger.LogWarning(
                        "SMTP nao configurado. Host={Host} FromEmail={FromEmail}. Fallback em log.",
                        smtpHost,
                        smtpFromEmail);
                    WriteSimulatedEmail(state, body, "SMTP não configurado. E-mail salvo em log para demonstração.");
                    return (false, "SMTP não configurado. E-mail registrado em log para demonstração.");
                }

                var port = 587;
                if (int.TryParse(smtpPortText, out var parsedPort))
                {
                    port = parsedPort;
                }

                using var client = new SmtpClient(smtpHost, port)
                {
                    EnableSsl = enableSsl,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false
                };

                if (!string.IsNullOrWhiteSpace(smtpUser) && !string.IsNullOrWhiteSpace(smtpPassword))
                {
                    client.Credentials = new NetworkCredential(smtpUser, smtpPassword);
                }

                using var message = new MailMessage
                {
                    From = new MailAddress(smtpFromEmail, smtpFromName),
                    Subject = "EduConnect - Primeiro acesso liberado",
                    Body = body,
                    IsBodyHtml = false
                };

                message.To.Add(state.Email);

                _logger.LogInformation(
                    "Tentando enviar e-mail de primeiro acesso. Para={Email} Host={Host} Port={Port}.",
                    state.Email,
                    smtpHost,
                    port);
                client.Send(message);

                _logger.LogInformation("E-mail enviado com sucesso. Para={Email}.", state.Email);
                WriteSimulatedEmail(state, body, "E-mail enviado com sucesso via SMTP e registrado em log.");
                return (true, $"Credenciais enviadas para {state.Email}.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha ao enviar e-mail SMTP. Para={Email}.", state.Email);
                var body = BuildEmailBody(state, _configuration["Smtp:AppUrl"] ?? "http://localhost:5173/login");
                _logger.LogWarning("Fallback de e-mail acionado. Log local gravado.");
                WriteSimulatedEmail(state, body, $"Falha SMTP: {ex.Message}. E-mail salvo em log para demonstração.");
                return (false, "Falha no SMTP. E-mail registrado em log para demonstração.");
            }
        }

        private static string BuildEmailBody(InscricaoState state, string appUrl)
        {
            return new StringBuilder()
                .AppendLine($"Olá, {state.FullName}.")
                .AppendLine()
                .AppendLine("Sua inscrição foi aprovada no EduConnect.")
                .AppendLine($"Curso: {state.Course}")
                .AppendLine($"Turma: {state.TurmaCodigo}")
                .AppendLine()
                .AppendLine("Credenciais de primeiro acesso:")
                .AppendLine($"Login: {state.TemporaryLogin}")
                .AppendLine($"Senha provisória: {state.TemporaryPassword}")
                .AppendLine()
                .AppendLine($"Acesse: {appUrl}")
                .AppendLine("No primeiro login, altere sua senha por segurança.")
                .ToString();
        }

        private static void WriteSimulatedEmail(InscricaoState state, string body, string note)
        {
            var directory = Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "mail-log");
            Directory.CreateDirectory(directory);

            var now = DateTime.UtcNow;
            var filename = $"{now:yyyyMMdd_HHmmss}_{state.CorrelationId}.txt";
            var path = Path.Combine(directory, filename);

            var content = new StringBuilder()
                .AppendLine("EduConnect - Log de E-mail de Primeiro Acesso")
                .AppendLine($"Data UTC: {now:O}")
                .AppendLine($"Protocolo: {state.CorrelationId}")
                .AppendLine($"Status inscrição: {state.Status}")
                .AppendLine($"Nome: {state.FullName}")
                .AppendLine($"E-mail destino: {state.Email}")
                .AppendLine($"Curso: {state.Course}")
                .AppendLine($"Turma: {state.TurmaCodigo}")
                .AppendLine($"Observação: {note}")
                .AppendLine()
                .AppendLine("--- Corpo do e-mail ---")
                .AppendLine(body)
                .ToString();

            System.IO.File.WriteAllText(path, content);
        }

        public class InscricaoRequest
        {
            [Required]
            [StringLength(120, MinimumLength = 5)]
            public string FullName { get; set; } = string.Empty;

            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required]
            [StringLength(30, MinimumLength = 8)]
            public string Phone { get; set; } = string.Empty;

            [Required]
            [RegularExpression("ADS|SI|CCO|ENG")]
            public string Course { get; set; } = string.Empty;

            public string? EmailTemplate { get; set; }
        }

        public class AprovarInscricaoRequest
        {
            [StringLength(40, MinimumLength = 2)]
            public string? TurmaCodigo { get; set; }
        }

        public class ReprovarInscricaoRequest
        {
            [StringLength(300)]
            public string? Motivo { get; set; }
        }

        public class InscricaoResponse
        {
            public string Status { get; set; } = string.Empty;
            public string CorrelationId { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Course { get; set; } = string.Empty;
            public string? TurmaCodigo { get; set; }
            public bool FirstAccessReleased { get; set; }
            public bool EmailSent { get; set; }
            public string? TemporaryLogin { get; set; }
            public string? TemporaryPassword { get; set; }
            public string? Message { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? ReviewedAt { get; set; }
            public string? ReviewedBy { get; set; }
            public string? Reason { get; set; }
        }

        private class InscricaoState
        {
            public string CorrelationId { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Course { get; set; } = string.Empty;
            public string EmailTemplate { get; set; } = string.Empty;
            public string? TurmaCodigo { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime LastSentAt { get; set; }
            public DateTime? ReviewedAt { get; set; }
            public string? ReviewedBy { get; set; }
            public string? Reason { get; set; }
            public bool FirstAccessReleased { get; set; }
            public bool EmailSent { get; set; }
            public string? TemporaryLogin { get; set; }
            public string? TemporaryPassword { get; set; }
            public string? EmailLastMessage { get; set; }
        }
    }
}
