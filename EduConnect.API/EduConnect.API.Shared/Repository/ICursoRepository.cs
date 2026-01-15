using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public interface ICursoRepository
    {
        Task<Curso> CriarAsync(Curso curso);
        Task<Curso?> ObterPorIdAsync(int id);
        Task<Curso?> ObterPorIdComVinculosAsync(int id);
        Task<IEnumerable<Curso>> ObterTodosAsync();
        Task<Curso> AtualizarAsync(Curso curso);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeAsync();
    }
}