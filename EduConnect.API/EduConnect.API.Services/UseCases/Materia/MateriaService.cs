using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using EduConnect.API.Services.Exceptions;
using EduConnect.API.Services.UseCases.Materia.Dtos;
using EduConnect.API.Shared.Repository;
using MateriaEntity = EduConnect.API.Shared.Entities.Materia;

namespace EduConnect.API.Services.UseCases.Materia
{
    public class MateriaService : IMateriaService
    {
        private readonly IMateriaRepository _materiaRepository;
        private readonly ICursoRepository _cursoRepository;
        private readonly IMapper _mapper;

        public MateriaService(IMateriaRepository materiaRepository, ICursoRepository cursoRepository, IMapper mapper)
        {
            _materiaRepository = materiaRepository;
            _cursoRepository = cursoRepository;
            _mapper = mapper;
        }

        public async Task<MateriaListagemDto> CriarAsync(MateriaCriacaoDto dto)
        {
            var curso = await _cursoRepository.ObterPorIdAsync(dto.CursoId);
            if (curso == null)
            {
                throw new ArgumentException("CursoId inválido.");
            }

            var entity = _mapper.Map<MateriaEntity>(dto);

            var created = await _materiaRepository.CriarAsync(entity);
            var loaded = await _materiaRepository.ObterPorIdComCursoAsync(created.Id);

            return _mapper.Map<MateriaListagemDto>(loaded ?? created);
        }

        public async Task<MateriaListagemDto?> ObterPorIdAsync(int id)
        {
            var entity = await _materiaRepository.ObterPorIdComCursoAsync(id);
            if (entity == null)
            {
                return null;
            }

            return _mapper.Map<MateriaListagemDto>(entity);
        }

        public async Task<IEnumerable<MateriaListagemDto>> ListarAsync()
        {
            var entities = await _materiaRepository.ObterTodosAsync();
            return entities.Select(_mapper.Map<MateriaListagemDto>);
        }

        public async Task<MateriaListagemDto> AtualizarAsync(int id, MateriaAtualizacaoDto dto)
        {
            var existente = await _materiaRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Matéria não encontrada.");
            }

            var curso = await _cursoRepository.ObterPorIdAsync(dto.CursoId);
            if (curso == null)
            {
                throw new ArgumentException("CursoId inválido.");
            }

            _mapper.Map(dto, existente);

            await _materiaRepository.AtualizarAsync(existente);

            var loaded = await _materiaRepository.ObterPorIdComCursoAsync(existente.Id);
            return _mapper.Map<MateriaListagemDto>(loaded ?? existente);
        }

        public async Task DeletarAsync(int id)
        {
            var existente = await _materiaRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Matéria não encontrada.");
            }

            await _materiaRepository.DeletarAsync(id);
        }

        public Task<int> ObterQuantidadeDeMateriasAsync()
        {
            return _materiaRepository.ObterQuantidadeAsync();
        }
    }
}
