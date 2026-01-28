using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public interface IEventoRepository
    {
        Task<Evento> CriarAsync(Evento evento);
        Task<Evento?> ObterPorIdAsync(int id);
        Task<Evento?> ObterPorIdComVinculosAsync(int id);
        Task<IEnumerable<Evento>> ObterTodosAsync();
        Task<Evento> AtualizarAsync(Evento evento);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeAsync();
    }
}
