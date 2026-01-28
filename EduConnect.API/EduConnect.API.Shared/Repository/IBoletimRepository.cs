using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public interface IBoletimRepository
    {
        Task<Aluno?> ObterAlunoComDadosAsync(int alunoId);
        Task<IReadOnlyList<Matricula>> ObterMatriculasPorAlunoESemestreAsync(int alunoId, string semestre);
    }
}
