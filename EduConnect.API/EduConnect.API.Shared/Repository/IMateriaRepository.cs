using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public interface IMateriaRepository
    {
        Task<Materia> CriarAsync(Materia materia);
        Task<Materia?> ObterPorIdAsync(int id);
        Task<Materia?> ObterPorIdComCursoAsync(int id);
        Task<IEnumerable<Materia>> ObterTodosAsync();
        Task<Materia> AtualizarAsync(Materia materia);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeAsync();
    }
}
