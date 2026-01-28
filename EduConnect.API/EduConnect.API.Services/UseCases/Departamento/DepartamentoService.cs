using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using EduConnect.API.Services.Exceptions;
using EduConnect.API.Services.UseCases.Departamento.Dtos;
using EduConnect.API.Shared.Repository;
using DepartamentoEntity = EduConnect.API.Shared.Entities.Departamento;

namespace EduConnect.API.Services.UseCases.Departamento
{
    public class DepartamentoService : IDepartamentoService
    {
        private readonly IDepartamentoRepository _departamentoRepository;
        private readonly IMapper _mapper;

        public DepartamentoService(IDepartamentoRepository departamentoRepository, IMapper mapper)
        {
            _departamentoRepository = departamentoRepository;
            _mapper = mapper;
        }

        public async Task<DepartamentoListagemDto> CriarAsync(DepartamentoCriacaoDto dto)
        {
            var entity = _mapper.Map<DepartamentoEntity>(dto);

            var created = await _departamentoRepository.CriarAsync(entity);
            var loaded = await _departamentoRepository.ObterPorIdComCursosAsync(created.Id);

            return _mapper.Map<DepartamentoListagemDto>(loaded ?? created);
        }

        public async Task<DepartamentoListagemDto?> ObterPorIdAsync(int id)
        {
            var entity = await _departamentoRepository.ObterPorIdComCursosAsync(id);
            if (entity == null)
            {
                return null;
            }

            return _mapper.Map<DepartamentoListagemDto>(entity);
        }

        public async Task<IEnumerable<DepartamentoListagemDto>> ListarAsync()
        {
            var entities = await _departamentoRepository.ObterTodosAsync();
            return entities.Select(_mapper.Map<DepartamentoListagemDto>);
        }

        public async Task<DepartamentoListagemDto> AtualizarAsync(int id, DepartamentoAtualizacaoDto dto)
        {
            var existente = await _departamentoRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Departamento não encontrado.");
            }

            _mapper.Map(dto, existente);

            await _departamentoRepository.AtualizarAsync(existente);

            var loaded = await _departamentoRepository.ObterPorIdComCursosAsync(existente.Id);
            return _mapper.Map<DepartamentoListagemDto>(loaded ?? existente);
        }

        public async Task DeletarAsync(int id)
        {
            var departamento = await _departamentoRepository.ObterPorIdAsync(id);
            if (departamento == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Departamento não encontrado.");
            }

            await _departamentoRepository.DeletarAsync(id);
        }

        public Task<int> ObterQuantidadeDeDepartamentosAsync()
        {
            return _departamentoRepository.ObterQuantidadeAsync();
        }
    }
}