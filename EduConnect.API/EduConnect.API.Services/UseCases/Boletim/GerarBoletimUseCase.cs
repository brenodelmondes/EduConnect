using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using EduConnect.API.Services.Exceptions;
using EduConnect.API.Services.UseCases.Boletim.Dtos;
using EduConnect.API.Shared.Repository;
using Microsoft.Extensions.Configuration;

namespace EduConnect.API.Services.UseCases.Boletim
{
    public class GerarBoletimUseCase
    {
        private const decimal MediaMinima = 6.0m;
        private const int FrequenciaMinima = 75;

        private readonly IBoletimRepository _boletimRepository;
        private readonly IBoletimSpRepository _boletimSpRepository;
        private readonly IConfiguration _configuration;
        private readonly IBoletimPdfGenerator _pdfGenerator;

        public GerarBoletimUseCase(
            IBoletimRepository boletimRepository,
            IBoletimSpRepository boletimSpRepository,
            IConfiguration configuration,
            IBoletimPdfGenerator pdfGenerator)
        {
            _boletimRepository = boletimRepository;
            _boletimSpRepository = boletimSpRepository;
            _configuration = configuration;
            _pdfGenerator = pdfGenerator;
        }

        public async Task<byte[]> ExecutarAsync(int alunoId, string semestre)
        {
            var sem = (semestre ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(sem))
            {
                throw RegraDeNegocioException.Conflito("Semestre inválido.");
            }

            var usarSp = false;

            var raw = _configuration["Boletim:UsarStoredProcedure"];
            if (!string.IsNullOrWhiteSpace(raw))
            {
                bool.TryParse(raw, out usarSp);
            }

            if (usarSp)
            {
                var linhas = await _boletimSpRepository.ObterBoletimAsync(alunoId, sem);
                if (linhas == null || linhas.Count == 0)
                {
                    var alunoExiste = await _boletimRepository.ObterAlunoComDadosAsync(alunoId);
                    if (alunoExiste == null)
                    {
                        throw RegraDeNegocioException.NaoEncontrado("Aluno não encontrado.");
                    }

                    throw RegraDeNegocioException.NaoEncontrado("Sem registros para o semestre.");
                }

                var primeira = linhas[0];

                var disciplinas = linhas
                    .OrderBy(l => l.MateriaNome)
                    .Select(l => new BoletimDisciplinaDto
                    {
                        Materia = l.MateriaNome,
                        Professor = string.Join(" ", new[] { l.ProfessorNome, l.ProfessorSobrenome }.Where(x => !string.IsNullOrWhiteSpace(x))).Trim(),
                        Ac1 = l.Ac1,
                        Ac2 = l.Ac2,
                        Ac3 = l.Ac3,
                        MediaFinal = l.MediaFinal,
                        Frequencia = l.Frequencia,
                        Situacao = CalcularSituacao(l.MediaFinal, l.Frequencia)
                    })
                    .ToList();

                var mediasValidas = disciplinas
                    .Where(d => d.MediaFinal.HasValue)
                    .Select(d => d.MediaFinal!.Value)
                    .ToList();

                decimal? mediaGeral = null;
                if (mediasValidas.Count > 0)
                {
                    mediaGeral = Math.Round(mediasValidas.Average(), 2);
                }

                var boletim = new BoletimDto
                {
                    AlunoId = primeira.AlunoId,
                    AlunoNome = $"{primeira.AlunoNome} {primeira.AlunoSobrenome}".Trim(),
                    Ra = primeira.AlunoRa,
                    Curso = primeira.CursoNome,
                    Semestre = primeira.Semestre,
                    MediaGeralDoSemestre = mediaGeral,
                    Disciplinas = disciplinas,
                    GeradoEm = DateTime.UtcNow
                };

                return _pdfGenerator.Gerar(boletim);
            }

            var aluno = await _boletimRepository.ObterAlunoComDadosAsync(alunoId);
            if (aluno == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Aluno não encontrado.");
            }

            var matriculas = await _boletimRepository.ObterMatriculasPorAlunoESemestreAsync(alunoId, sem);
            if (matriculas == null || matriculas.Count == 0)
            {
                throw RegraDeNegocioException.NaoEncontrado("Sem registros para o semestre.");
            }

            var disciplinasLinq = matriculas
                .OrderBy(m => m.Turma.Materia.Nome)
                .Select(m => new BoletimDisciplinaDto
                {
                    Materia = m.Turma.Materia.Nome,
                    Professor = m.Turma.Professor.Titulacao,
                    Ac1 = m.Ac1,
                    Ac2 = m.Ac2,
                    Ac3 = m.Ac3,
                    MediaFinal = m.MediaFinal,
                    Frequencia = m.Frequencia,
                    Situacao = CalcularSituacao(m.MediaFinal, m.Frequencia)
                })
                .ToList();

            var mediasValidasLinq = disciplinasLinq
                .Where(d => d.MediaFinal.HasValue)
                .Select(d => d.MediaFinal!.Value)
                .ToList();

            decimal? mediaGeralLinq = null;
            if (mediasValidasLinq.Count > 0)
            {
                mediaGeralLinq = Math.Round(mediasValidasLinq.Average(), 2);
            }

            var boletimLinq = new BoletimDto
            {
                AlunoId = aluno.Id,
                AlunoNome = $"{aluno.Usuario.Nome} {aluno.Usuario.Sobrenome}".Trim(),
                Ra = aluno.Ra,
                Curso = aluno.Curso.Nome,
                Semestre = sem,
                MediaGeralDoSemestre = mediaGeralLinq,
                Disciplinas = disciplinasLinq,
                GeradoEm = DateTime.UtcNow
            };

            return _pdfGenerator.Gerar(boletimLinq);
        }

        private static string CalcularSituacao(decimal? mediaFinal, int? frequencia)
        {
            if (!mediaFinal.HasValue || !frequencia.HasValue)
            {
                return "Pendente";
            }

            var aprovado = mediaFinal.Value >= MediaMinima && frequencia.Value >= FrequenciaMinima;
            return aprovado ? "Aprovado" : "Reprovado";
        }
    }
}
