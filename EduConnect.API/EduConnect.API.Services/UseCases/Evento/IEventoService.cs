using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Evento.Dtos;

namespace EduConnect.API.Services.UseCases.Evento
{
    public interface IEventoService
    {
        Task<EventoListagemDto> CriarAsync(EventoCriacaoDto dto);
        Task<EventoListagemDto?> ObterPorIdAsync(int id);
        Task<IEnumerable<EventoListagemDto>> ListarAsync();
        Task<EventoListagemDto> AtualizarAsync(int id, EventoAtualizacaoDto dto);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeDeEventosAsync();
    }
}
