using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using EduConnect.API.Services.Exceptions;
using EduConnect.API.Services.UseCases.Turma.Dtos;
using EduConnect.API.Shared.Repository;
using TurmaEntity = EduConnect.API.Shared.Entities.Turma;

namespace EduConnect.API.Services.UseCases.Turma
{
    public class TurmaService : ITurmaService
    {
        private readonly ITurmaRepository _turmaRepository;
        private readonly IMateriaRepository _materiaRepository;
        private readonly IProfessorRepository _professorRepository;
        private readonly IMapper _mapper;

        public TurmaService(ITurmaRepository turmaRepository, IMateriaRepository materiaRepository, IProfessorRepository professorRepository, IMapper mapper)
        {
            _turmaRepository = turmaRepository;
            _materiaRepository = materiaRepository;
            _professorRepository = professorRepository;
            _mapper = mapper;
        }

        public async Task<TurmaListagemDto> CriarAsync(TurmaCriacaoDto dto)
        {
            var materia = await _materiaRepository.ObterPorIdAsync(dto.MateriaId);
            if (materia == null)
            {
                throw new ArgumentException("MateriaId inválido.");
            }

            var professor = await _professorRepository.ObterPorIdAsync(dto.ProfessorId);
            if (professor == null)
            {
                throw new ArgumentException("ProfessorId inválido.");
            }

            var entity = _mapper.Map<TurmaEntity>(dto);

            var created = await _turmaRepository.CriarAsync(entity);
            var loaded = await _turmaRepository.ObterPorIdComVinculosAsync(created.Id);

            return _mapper.Map<TurmaListagemDto>(loaded ?? created);
        }

        public async Task<TurmaListagemDto?> ObterPorIdAsync(int id)
        {
            var entity = await _turmaRepository.ObterPorIdComVinculosAsync(id);
            if (entity == null)
            {
                return null;
            }

            return _mapper.Map<TurmaListagemDto>(entity);
        }

        public async Task<IEnumerable<TurmaListagemDto>> ListarAsync()
        {
            var entities = await _turmaRepository.ObterTodosAsync();
            return entities.Select(_mapper.Map<TurmaListagemDto>);
        }

        public async Task<TurmaListagemDto> AtualizarAsync(int id, TurmaAtualizacaoDto dto)
        {
            var existente = await _turmaRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Turma não encontrada.");
            }

            var materia = await _materiaRepository.ObterPorIdAsync(dto.MateriaId);
            if (materia == null)
            {
                throw new ArgumentException("MateriaId inválido.");
            }

            var professor = await _professorRepository.ObterPorIdAsync(dto.ProfessorId);
            if (professor == null)
            {
                throw new ArgumentException("ProfessorId inválido.");
            }

            _mapper.Map(dto, existente);

            await _turmaRepository.AtualizarAsync(existente);

            var loaded = await _turmaRepository.ObterPorIdComVinculosAsync(existente.Id);
            return _mapper.Map<TurmaListagemDto>(loaded ?? existente);
        }

        public async Task DeletarAsync(int id)
        {
            var existente = await _turmaRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Turma não encontrada.");
            }

            await _turmaRepository.DeletarAsync(id);
        }

        public Task<int> ObterQuantidadeDeTurmasAsync()
        {
            return _turmaRepository.ObterQuantidadeAsync();
        }
    }
}
