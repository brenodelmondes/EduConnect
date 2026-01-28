using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Data.SpResults;

namespace EduConnect.API.Shared.Repository
{
    public interface IBoletimSpRepository
    {
        Task<List<BoletimLinhaSp>> ObterBoletimAsync(int alunoId, string semestre);
    }
}
