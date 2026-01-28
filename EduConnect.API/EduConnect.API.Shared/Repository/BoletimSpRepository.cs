using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Data.SpResults;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class BoletimSpRepository : IBoletimSpRepository
    {
        private readonly AppDbContext _db;

        public BoletimSpRepository(AppDbContext db)
        {
            _db = db;
        }

        public Task<List<BoletimLinhaSp>> ObterBoletimAsync(int alunoId, string semestre)
        {
            return _db.BoletimLinhasSp
                .FromSqlInterpolated($"EXEC dbo.sp_boletim_aluno_semestre @AlunoId={alunoId}, @Semestre={semestre}")
                .ToListAsync();
        }
    }
}
