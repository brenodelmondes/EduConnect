using EduConnect.API.Shared.Entities;
using EduConnect.API.Shared.Repository;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Services;

public static class DataSeeder
{
    public static async Task SeedAdminAsync(IServiceProvider services, IConfiguration configuration)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Garante Perfis (caso banco não tenha recebido HasData por migrations)
        if (!await db.Perfis.AnyAsync())
        {
            db.Perfis.AddRange(
                new Perfil { Id = 1, Nome = "Administrador" },
                new Perfil { Id = 2, Nome = "Professor" },
                new Perfil { Id = 3, Nome = "Aluno" }
            );
            await db.SaveChangesAsync();
        }

        var adminEmail = configuration["Seed:DefaultEmail"] ?? "admin@educonnect.com";
        var adminPassword = configuration["Seed:DefaultPassword"] ?? "123456";
        var adminName = configuration["Seed:DefaultName"] ?? "Admin";

        var normalizedAdminEmail = adminEmail.Trim().ToLowerInvariant();

        var existing = await db.Usuarios.FirstOrDefaultAsync(u => u.Email.Trim().ToLower() == normalizedAdminEmail);
        if (existing != null)
        {
            // Se a senha atual não parece bcrypt, corrige na inicialização
            if (string.IsNullOrWhiteSpace(existing.Senha) || !existing.Senha.StartsWith("$2"))
            {
                existing.Senha = BCrypt.Net.BCrypt.HashPassword(adminPassword);
                await db.SaveChangesAsync();
            }
            await SeedProfessorAndAlunoAsync(db, configuration);
            return;
        }

        db.Usuarios.Add(new Usuario
        {
            Nome = adminName,
            Sobrenome = "Sistema",
            Email = adminEmail.Trim(),
            Cpf = "12345678910",
            PerfilId = 1,
            Senha = BCrypt.Net.BCrypt.HashPassword(adminPassword)
        });

        await db.SaveChangesAsync();

        await SeedProfessorAndAlunoAsync(db, configuration);
    }

    private static async Task SeedProfessorAndAlunoAsync(AppDbContext db, IConfiguration configuration)
    {
        var defaultPassword = configuration["Seed:DefaultPassword"] ?? "123456";

        var departamento = await db.Departamentos.FirstOrDefaultAsync();
        if (departamento == null)
        {
            departamento = new Departamento { Nome = "Computação" };
            db.Departamentos.Add(departamento);
            await db.SaveChangesAsync();
        }

        var curso = await db.Cursos.FirstOrDefaultAsync();
        if (curso == null)
        {
            curso = new Curso
            {
                Nome = "Análise e Desenvolvimento de Sistemas",
                DepartamentoId = departamento.Id,
            };
            db.Cursos.Add(curso);
            await db.SaveChangesAsync();
        }

        var professorEmail = (configuration["Seed:ProfessorEmail"] ?? "professor@educonnect.com").Trim().ToLowerInvariant();
        var professorUser = await db.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == professorEmail);
        if (professorUser == null)
        {
            professorUser = new Usuario
            {
                Nome = "Professor",
                Sobrenome = "Demo",
                Email = professorEmail,
                Cpf = "12345678911",
                PerfilId = 2,
                Senha = BCrypt.Net.BCrypt.HashPassword(defaultPassword)
            };
            db.Usuarios.Add(professorUser);
            await db.SaveChangesAsync();
        }

        var professorRegistro = await db.Professores.FirstOrDefaultAsync(p => p.UsuarioId == professorUser.Id);
        if (professorRegistro == null)
        {
            db.Professores.Add(new Professor
            {
                UsuarioId = professorUser.Id,
                DepartamentoId = departamento.Id,
                Titulacao = "Mestre"
            });
            await db.SaveChangesAsync();
        }

        professorRegistro = await db.Professores.FirstOrDefaultAsync(p => p.UsuarioId == professorUser.Id);

        var alunoEmail = (configuration["Seed:AlunoEmail"] ?? "aluno@educonnect.com").Trim().ToLowerInvariant();
        var alunoUser = await db.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == alunoEmail);
        if (alunoUser == null)
        {
            alunoUser = new Usuario
            {
                Nome = "Aluno",
                Sobrenome = "Demo",
                Email = alunoEmail,
                Cpf = "12345678912",
                PerfilId = 3,
                Senha = BCrypt.Net.BCrypt.HashPassword(defaultPassword)
            };
            db.Usuarios.Add(alunoUser);
            await db.SaveChangesAsync();
        }

        var alunoRegistro = await db.Alunos.FirstOrDefaultAsync(a => a.UsuarioId == alunoUser.Id);
        if (alunoRegistro == null)
        {
            db.Alunos.Add(new Aluno
            {
                UsuarioId = alunoUser.Id,
                CursoId = curso.Id,
                Ra = "RA000001"
            });
            await db.SaveChangesAsync();
        }

        alunoRegistro = await db.Alunos.FirstOrDefaultAsync(a => a.UsuarioId == alunoUser.Id);

        if (professorRegistro != null && alunoRegistro != null)
        {
            await SeedAcademicRecordsAsync(db, curso.Id, professorRegistro.Id, alunoRegistro.Id);
        }
    }

    private static async Task SeedAcademicRecordsAsync(AppDbContext db, int cursoId, int professorId, int alunoId)
    {
        var materia = await db.Materias.FirstOrDefaultAsync(m => m.CursoId == cursoId && m.Nome == "Algoritmos e Programação");
        if (materia == null)
        {
            materia = new Materia
            {
                Nome = "Algoritmos e Programação",
                CursoId = cursoId,
            };
            db.Materias.Add(materia);
            await db.SaveChangesAsync();
        }

        var semestreAtual = $"{DateTime.UtcNow.Year}.{(DateTime.UtcNow.Month <= 6 ? 1 : 2)}";
        var turma = await db.Turmas.FirstOrDefaultAsync(t =>
            t.MateriaId == materia.Id &&
            t.ProfessorId == professorId &&
            t.Semestre == semestreAtual);

        if (turma == null)
        {
            turma = new Turma
            {
                MateriaId = materia.Id,
                ProfessorId = professorId,
                Semestre = semestreAtual,
                Local = "Sala A1",
            };
            db.Turmas.Add(turma);
            await db.SaveChangesAsync();
        }

        var matricula = await db.Matriculas.FirstOrDefaultAsync(m => m.AlunoId == alunoId && m.TurmaId == turma.Id);
        if (matricula == null)
        {
            db.Matriculas.Add(new Matricula
            {
                AlunoId = alunoId,
                TurmaId = turma.Id,
                Ac1 = 7.5m,
                Ac2 = 8.0m,
                Ac3 = 8.5m,
                MediaFinal = 8.0m,
                Frequencia = 92,
            });
            await db.SaveChangesAsync();
        }
    }
}
