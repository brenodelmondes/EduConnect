using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public interface IProfessorRepository
    {
        Task<Professor> CriarAsync(Professor professor);
        Task<Professor?> ObterPorIdAsync(int id);
        Task<IEnumerable<Professor>> ObterTodosAsync();
        Task<Professor> AtualizarAsync(Professor professor);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeAsync();
    }
}