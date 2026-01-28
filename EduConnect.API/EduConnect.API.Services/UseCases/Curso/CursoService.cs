using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using EduConnect.API.Services.Exceptions;
using EduConnect.API.Services.UseCases.Curso.Dtos;
using EduConnect.API.Shared.Repository;
using CursoEntity = EduConnect.API.Shared.Entities.Curso;

namespace EduConnect.API.Services.UseCases.Curso
{
    public class CursoService : ICursoService
    {
        private readonly ICursoRepository _cursoRepository;
        private readonly IDepartamentoRepository _departamentoRepository;
        private readonly IMapper _mapper;

        public CursoService(ICursoRepository cursoRepository, IDepartamentoRepository departamentoRepository, IMapper mapper)
        {
            _cursoRepository = cursoRepository;
            _departamentoRepository = departamentoRepository;
            _mapper = mapper;
        }

        public async Task<CursoListagemDto> CriarAsync(CursoCriacaoDto dto)
        {
            var departamento = await _departamentoRepository.ObterPorIdAsync(dto.DepartamentoId);
            if (departamento == null)
            {
                throw new ArgumentException("DepartamentoId inválido.");
            }

            var entity = _mapper.Map<CursoEntity>(dto);

            var created = await _cursoRepository.CriarAsync(entity);
            var loaded = await _cursoRepository.ObterPorIdComVinculosAsync(created.Id);

            return _mapper.Map<CursoListagemDto>(loaded ?? created);
        }

        public async Task<CursoListagemDto?> ObterPorIdAsync(int id)
        {
            var entity = await _cursoRepository.ObterPorIdComVinculosAsync(id);
            if (entity == null)
            {
                return null;
            }

            return _mapper.Map<CursoListagemDto>(entity);
        }

        public async Task<IEnumerable<CursoListagemDto>> ListarAsync()
        {
            var entities = await _cursoRepository.ObterTodosAsync();
            return entities.Select(_mapper.Map<CursoListagemDto>);
        }

        public async Task<CursoListagemDto> AtualizarAsync(int id, CursoAtualizacaoDto dto)
        {
            var existente = await _cursoRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Curso não encontrado.");
            }

            var departamento = await _departamentoRepository.ObterPorIdAsync(dto.DepartamentoId);
            if (departamento == null)
            {
                throw new ArgumentException("DepartamentoId inválido.");
            }

            _mapper.Map(dto, existente);

            await _cursoRepository.AtualizarAsync(existente);

            var loaded = await _cursoRepository.ObterPorIdComVinculosAsync(existente.Id);
            return _mapper.Map<CursoListagemDto>(loaded ?? existente);
        }

        public async Task DeletarAsync(int id)
        {
            var curso = await _cursoRepository.ObterPorIdComVinculosAsync(id);
            if (curso == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Curso não encontrado.");
            }

            if (curso.Alunos?.Any() == true || curso.Materias?.Any() == true)
            {
                throw RegraDeNegocioException.Conflito("Não é possível excluir o curso pois há alunos e/ou matérias vinculadas.");
            }

            await _cursoRepository.DeletarAsync(id);
        }

        public Task<int> ObterQuantidadeDeCursosAsync()
        {
            return _cursoRepository.ObterQuantidadeAsync();
        }
    }
}