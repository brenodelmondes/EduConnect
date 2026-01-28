using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class MateriaRepository : IMateriaRepository
    {
        private readonly AppDbContext _context;

        public MateriaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Materia> CriarAsync(Materia materia)
        {
            _context.Materias.Add(materia);
            await _context.SaveChangesAsync();
            return materia;
        }

        public Task<Materia?> ObterPorIdAsync(int id)
        {
            return _context.Materias.FindAsync(id).AsTask();
        }

        public Task<Materia?> ObterPorIdComCursoAsync(int id)
        {
            return _context.Materias
                .Include(m => m.Curso)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<IEnumerable<Materia>> ObterTodosAsync()
        {
            return await _context.Materias
                .Include(m => m.Curso)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Materia> AtualizarAsync(Materia materia)
        {
            _context.Entry(materia).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return materia;
        }

        public async Task DeletarAsync(int id)
        {
            var materia = await _context.Materias.FindAsync(id);
            if (materia != null)
            {
                _context.Materias.Remove(materia);
                await _context.SaveChangesAsync();
            }
        }

        public Task<int> ObterQuantidadeAsync()
        {
            return _context.Materias.CountAsync();
        }
    }
}
