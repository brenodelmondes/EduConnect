using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using EduConnect.API.Services.Exceptions;
using EduConnect.API.Services.UseCases.Evento.Dtos;
using EduConnect.API.Shared.Entities;
using EduConnect.API.Shared.Repository;
using EventoEntity = EduConnect.API.Shared.Entities.Evento;

namespace EduConnect.API.Services.UseCases.Evento
{
    public class EventoService : IEventoService
    {
        private readonly IEventoRepository _eventoRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly ITurmaRepository _turmaRepository;
        private readonly IMapper _mapper;

        public EventoService(IEventoRepository eventoRepository, IUsuarioRepository usuarioRepository, ITurmaRepository turmaRepository, IMapper mapper)
        {
            _eventoRepository = eventoRepository;
            _usuarioRepository = usuarioRepository;
            _turmaRepository = turmaRepository;
            _mapper = mapper;
        }

        public async Task<EventoListagemDto> CriarAsync(EventoCriacaoDto dto)
        {
            await ValidarAsync(dto.UsuarioId, dto.Scope, dto.TurmaId);

            var entity = _mapper.Map<EventoEntity>(dto);

            var created = await _eventoRepository.CriarAsync(entity);
            var loaded = await _eventoRepository.ObterPorIdComVinculosAsync(created.Id);

            return _mapper.Map<EventoListagemDto>(loaded ?? created);
        }

        public async Task<EventoListagemDto?> ObterPorIdAsync(int id)
        {
            var entity = await _eventoRepository.ObterPorIdComVinculosAsync(id);
            if (entity == null)
            {
                return null;
            }

            return _mapper.Map<EventoListagemDto>(entity);
        }

        public async Task<IEnumerable<EventoListagemDto>> ListarAsync()
        {
            var entities = await _eventoRepository.ObterTodosAsync();
            return entities.Select(_mapper.Map<EventoListagemDto>);
        }

        public async Task<EventoListagemDto> AtualizarAsync(int id, EventoAtualizacaoDto dto)
        {
            var existente = await _eventoRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Evento não encontrado.");
            }

            await ValidarAsync(dto.UsuarioId, dto.Scope, dto.TurmaId);

            _mapper.Map(dto, existente);

            await _eventoRepository.AtualizarAsync(existente);

            var loaded = await _eventoRepository.ObterPorIdComVinculosAsync(existente.Id);
            return _mapper.Map<EventoListagemDto>(loaded ?? existente);
        }

        public async Task DeletarAsync(int id)
        {
            var existente = await _eventoRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Evento não encontrado.");
            }

            await _eventoRepository.DeletarAsync(id);
        }

        public Task<int> ObterQuantidadeDeEventosAsync()
        {
            return _eventoRepository.ObterQuantidadeAsync();
        }

        private async Task ValidarAsync(int usuarioId, EventoScope scope, int? turmaId)
        {
            var usuario = await _usuarioRepository.ObterPorIdAsync(usuarioId);
            if (usuario == null)
            {
                throw new ArgumentException("UsuarioId inválido.");
            }

            if (scope == EventoScope.Turma)
            {
                if (!turmaId.HasValue)
                {
                    throw RegraDeNegocioException.Conflito("TurmaId é obrigatório quando o escopo é Turma.");
                }

                var turma = await _turmaRepository.ObterPorIdAsync(turmaId.Value);
                if (turma == null)
                {
                    throw new ArgumentException("TurmaId inválido.");
                }
            }

            if (scope != EventoScope.Turma && turmaId.HasValue)
            {
                throw RegraDeNegocioException.Conflito("TurmaId só pode ser informado quando o escopo é Turma.");
            }
        }
    }
}
