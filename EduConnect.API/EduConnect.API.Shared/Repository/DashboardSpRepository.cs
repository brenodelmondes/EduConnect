using System.Linq;
using System.Threading.Tasks;
using EduConnect.API.Shared.Data.SpResults;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class DashboardSpRepository : IDashboardSpRepository
    {
        private readonly AppDbContext _db;

        public DashboardSpRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<DashboardResumoSp?> ObterResumoAsync()
        {
            return await _db.DashboardResumosSp
                .FromSqlInterpolated($"EXEC dbo.sp_dashboard_resumo")
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }
    }
}
