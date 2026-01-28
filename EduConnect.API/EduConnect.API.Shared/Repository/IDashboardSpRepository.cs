using System.Threading.Tasks;
using EduConnect.API.Shared.Data.SpResults;

namespace EduConnect.API.Shared.Repository
{
    public interface IDashboardSpRepository
    {
        Task<DashboardResumoSp?> ObterResumoAsync();
    }
}
