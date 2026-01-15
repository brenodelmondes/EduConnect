using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class CursoRepository : ICursoRepository
    {
        private readonly AppDbContext _context;

        public CursoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Curso> CriarAsync(Curso curso)
        {
            _context.Cursos.Add(curso);
            await _context.SaveChangesAsync();
            return curso;
        }

        public Task<Curso?> ObterPorIdAsync(int id)
        {
            return _context.Cursos.FindAsync(id).AsTask();
        }

        public Task<Curso?> ObterPorIdComVinculosAsync(int id)
        {
            return _context.Cursos
                .Include(c => c.Materias)
                .Include(c => c.Alunos)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Curso>> ObterTodosAsync()
        {
            return await _context.Cursos
                .Include(c => c.Departamento)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Curso> AtualizarAsync(Curso curso)
        {
            _context.Entry(curso).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return curso;
        }

        public async Task DeletarAsync(int id)
        {
            var curso = await _context.Cursos.FindAsync(id);
            if (curso != null)
            {
                _context.Cursos.Remove(curso);
                await _context.SaveChangesAsync();
            }
        }

        public Task<int> ObterQuantidadeAsync()
        {
            return _context.Cursos.CountAsync();
        }
    }
}