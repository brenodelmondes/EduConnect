using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class ProfessorRepository : IProfessorRepository
    {
        private readonly AppDbContext _context;

        public ProfessorRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Professor> CriarAsync(Professor professor)
        {
            _context.Professores.Add(professor);
            await _context.SaveChangesAsync();
            return professor;
        }

        public Task<Professor?> ObterPorIdAsync(int id)
        {
            return _context.Professores.FindAsync(id).AsTask();
        }

        public async Task<IEnumerable<Professor>> ObterTodosAsync()
        {
            return await _context.Professores.AsNoTracking().ToListAsync();
        }

        public async Task<Professor> AtualizarAsync(Professor professor)
        {
            _context.Entry(professor).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return professor;
        }

        public async Task DeletarAsync(int id)
        {
            var professor = await _context.Professores.FindAsync(id);
            if (professor != null)
            {
                _context.Professores.Remove(professor);
                await _context.SaveChangesAsync();
            }
        }

        public Task<int> ObterQuantidadeAsync()
        {
            return _context.Professores.CountAsync();
        }
    }
}