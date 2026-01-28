using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class BoletimRepository : IBoletimRepository
    {
        private readonly AppDbContext _context;

        public BoletimRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task<Aluno?> ObterAlunoComDadosAsync(int alunoId)
        {
            return _context.Alunos
                .Include(a => a.Usuario)
                .Include(a => a.Curso)
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == alunoId);
        }

        public async Task<IReadOnlyList<Matricula>> ObterMatriculasPorAlunoESemestreAsync(int alunoId, string semestre)
        {
            var sem = (semestre ?? string.Empty).Trim();

            return await _context.Matriculas
                .Where(m => m.AlunoId == alunoId && m.Turma.Semestre == sem)
                .Include(m => m.Turma)
                    .ThenInclude(t => t.Materia)
                .Include(m => m.Turma)
                    .ThenInclude(t => t.Professor)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
