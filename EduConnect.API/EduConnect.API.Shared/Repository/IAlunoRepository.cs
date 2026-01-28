using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public interface IAlunoRepository
    {
        Task<Aluno> CriarAsync(Aluno aluno);
        Task<Aluno?> ObterPorIdAsync(int id);
        Task<Aluno?> ObterPorIdComVinculosAsync(int id);
        Task<IEnumerable<Aluno>> ObterTodosAsync();
        Task<Aluno> AtualizarAsync(Aluno aluno);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeAsync();
    }
}
