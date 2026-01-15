using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public interface IDepartamentoRepository
    {
        Task<Departamento> CriarAsync(Departamento departamento);
        Task<Departamento?> ObterPorIdAsync(int id);
        Task<Departamento?> ObterPorIdComCursosAsync(int id);
        Task<IEnumerable<Departamento>> ObterTodosAsync();
        Task<Departamento> AtualizarAsync(Departamento departamento);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeAsync();
    }
}