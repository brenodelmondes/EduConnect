using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public interface ITurmaRepository
    {
        Task<Turma> CriarAsync(Turma turma);
        Task<Turma?> ObterPorIdAsync(int id);
        Task<Turma?> ObterPorIdComVinculosAsync(int id);
        Task<IEnumerable<Turma>> ObterTodosAsync();
        Task<Turma> AtualizarAsync(Turma turma);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeAsync();
    }
}
