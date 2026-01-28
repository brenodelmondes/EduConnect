using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class TurmaRepository : ITurmaRepository
    {
        private readonly AppDbContext _context;

        public TurmaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Turma> CriarAsync(Turma turma)
        {
            _context.Turmas.Add(turma);
            await _context.SaveChangesAsync();
            return turma;
        }

        public Task<Turma?> ObterPorIdAsync(int id)
        {
            return _context.Turmas.FindAsync(id).AsTask();
        }

        public Task<Turma?> ObterPorIdComVinculosAsync(int id)
        {
            return _context.Turmas
                .Include(t => t.Materia)
                .Include(t => t.Professor)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Turma>> ObterTodosAsync()
        {
            return await _context.Turmas
                .Include(t => t.Materia)
                .Include(t => t.Professor)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Turma> AtualizarAsync(Turma turma)
        {
            _context.Entry(turma).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return turma;
        }

        public async Task DeletarAsync(int id)
        {
            var turma = await _context.Turmas.FindAsync(id);
            if (turma != null)
            {
                _context.Turmas.Remove(turma);
                await _context.SaveChangesAsync();
            }
        }

        public Task<int> ObterQuantidadeAsync()
        {
            return _context.Turmas.CountAsync();
        }
    }
}
