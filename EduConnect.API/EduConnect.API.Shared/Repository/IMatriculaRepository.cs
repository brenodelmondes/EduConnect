using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public interface IMatriculaRepository
    {
        Task<Matricula> CriarAsync(Matricula matricula);
        Task<Matricula?> ObterPorIdAsync(int id);
        Task<Matricula?> ObterPorIdComVinculosAsync(int id);
        Task<Matricula?> ObterPorAlunoETurmaAsync(int alunoId, int turmaId);
        Task<IEnumerable<Matricula>> ObterTodosAsync();
        Task<Matricula> AtualizarAsync(Matricula matricula);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeAsync();
    }
}
