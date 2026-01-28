using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using EduConnect.API.Services.Exceptions;
using EduConnect.API.Services.UseCases.Matricula.Dtos;
using EduConnect.API.Shared.Repository;
using MatriculaEntity = EduConnect.API.Shared.Entities.Matricula;

namespace EduConnect.API.Services.UseCases.Matricula
{
    public class MatriculaService : IMatriculaService
    {
        private const decimal NotaMinima = 0m;
        private const decimal NotaMaxima = 10m;
        private const int FrequenciaMinima = 75;

        private readonly IMatriculaRepository _matriculaRepository;
        private readonly IAlunoRepository _alunoRepository;
        private readonly ITurmaRepository _turmaRepository;
        private readonly IMapper _mapper;

        public MatriculaService(IMatriculaRepository matriculaRepository, IAlunoRepository alunoRepository, ITurmaRepository turmaRepository, IMapper mapper)
        {
            _matriculaRepository = matriculaRepository;
            _alunoRepository = alunoRepository;
            _turmaRepository = turmaRepository;
            _mapper = mapper;
        }

        public async Task<MatriculaListagemDto> CriarAsync(MatriculaCriacaoDto dto)
        {
            await ValidarAlunoETurmaAsync(dto.AlunoId, dto.TurmaId);

            var existente = await _matriculaRepository.ObterPorAlunoETurmaAsync(dto.AlunoId, dto.TurmaId);
            if (existente != null)
            {
                throw RegraDeNegocioException.Conflito("Já existe matrícula para este aluno nesta turma.");
            }

            ValidarNotas(dto.Ac1, dto.Ac2, dto.Ac3);
            ValidarFrequencia(dto.Frequencia);

            var entity = _mapper.Map<MatriculaEntity>(dto);
            entity.MediaFinal = CalcularMedia(entity.Ac1, entity.Ac2, entity.Ac3);

            var created = await _matriculaRepository.CriarAsync(entity);
            var loaded = await _matriculaRepository.ObterPorIdComVinculosAsync(created.Id);

            return _mapper.Map<MatriculaListagemDto>(loaded ?? created);
        }

        public async Task<MatriculaListagemDto?> ObterPorIdAsync(int id)
        {
            var entity = await _matriculaRepository.ObterPorIdComVinculosAsync(id);
            if (entity == null)
            {
                return null;
            }

            return _mapper.Map<MatriculaListagemDto>(entity);
        }

        public async Task<IEnumerable<MatriculaListagemDto>> ListarAsync()
        {
            var entities = await _matriculaRepository.ObterTodosAsync();
            return entities.Select(_mapper.Map<MatriculaListagemDto>);
        }

        public async Task<MatriculaListagemDto> AtualizarAsync(int id, MatriculaAtualizacaoDto dto)
        {
            var existente = await _matriculaRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Matrícula não encontrada.");
            }

            await ValidarAlunoETurmaAsync(dto.AlunoId, dto.TurmaId);

            var outra = await _matriculaRepository.ObterPorAlunoETurmaAsync(dto.AlunoId, dto.TurmaId);
            if (outra != null && outra.Id != id)
            {
                throw RegraDeNegocioException.Conflito("Já existe matrícula para este aluno nesta turma.");
            }

            ValidarNotas(dto.Ac1, dto.Ac2, dto.Ac3);
            ValidarFrequencia(dto.Frequencia);

            _mapper.Map(dto, existente);
            existente.MediaFinal = CalcularMedia(existente.Ac1, existente.Ac2, existente.Ac3);

            if (existente.Frequencia.HasValue && existente.Frequencia.Value < FrequenciaMinima)
            {
                throw RegraDeNegocioException.Conflito($"Frequência mínima é {FrequenciaMinima}%.");
            }

            await _matriculaRepository.AtualizarAsync(existente);

            var loaded = await _matriculaRepository.ObterPorIdComVinculosAsync(existente.Id);
            return _mapper.Map<MatriculaListagemDto>(loaded ?? existente);
        }

        public async Task DeletarAsync(int id)
        {
            var existente = await _matriculaRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Matrícula não encontrada.");
            }

            await _matriculaRepository.DeletarAsync(id);
        }

        public Task<int> ObterQuantidadeDeMatriculasAsync()
        {
            return _matriculaRepository.ObterQuantidadeAsync();
        }

        private async Task ValidarAlunoETurmaAsync(int alunoId, int turmaId)
        {
            var aluno = await _alunoRepository.ObterPorIdAsync(alunoId);
            if (aluno == null)
            {
                throw new ArgumentException("AlunoId inválido.");
            }

            var turma = await _turmaRepository.ObterPorIdAsync(turmaId);
            if (turma == null)
            {
                throw new ArgumentException("TurmaId inválido.");
            }
        }

        private static void ValidarNotas(decimal? ac1, decimal? ac2, decimal? ac3)
        {
            ValidarNota(ac1, nameof(ac1));
            ValidarNota(ac2, nameof(ac2));
            ValidarNota(ac3, nameof(ac3));
        }

        private static void ValidarNota(decimal? nota, string nome)
        {
            if (!nota.HasValue)
            {
                return;
            }

            if (nota.Value < NotaMinima || nota.Value > NotaMaxima)
            {
                throw RegraDeNegocioException.Conflito($"{nome} deve estar entre {NotaMinima} e {NotaMaxima}.");
            }
        }

        private static void ValidarFrequencia(int? frequencia)
        {
            if (!frequencia.HasValue)
            {
                return;
            }

            if (frequencia.Value < 0 || frequencia.Value > 100)
            {
                throw RegraDeNegocioException.Conflito("Frequência deve estar entre 0 e 100.");
            }
        }

        private static decimal? CalcularMedia(decimal? ac1, decimal? ac2, decimal? ac3)
        {
            var notas = new List<decimal>();
            if (ac1.HasValue) notas.Add(ac1.Value);
            if (ac2.HasValue) notas.Add(ac2.Value);
            if (ac3.HasValue) notas.Add(ac3.Value);

            if (notas.Count == 0)
            {
                return null;
            }

            return Math.Round(notas.Average(), 2);
        }
    }
}
