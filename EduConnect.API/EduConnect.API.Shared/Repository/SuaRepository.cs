using EduConnect.API.Shared.Entities.Professor;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class SuaRepository : ISuaRepository
    {
        private readonly AppDbContext _context;

        public SuaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Professor> CriarProfessorAsync(Professor professor)
        {
            _context.Professores.Add(professor);
            await _context.SaveChangesAsync();
            return professor;
        }

        public async Task<Professor> ProfessorPorIdAsync(int id)
        {
            return await _context.Professores.FindAsync(id);
        }

        public async Task<IEnumerable<Professor>> ObterTodosProfessoresAsync()
        {
            return await _context.Professores.ToListAsync();
        }

        public async Task<Professor> AtualizarProfessorAsync(Professor professor)
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

        public Task<int> ObterQuantidadeProfessoresAsync()
        {
            throw new NotImplementedException();
        }

        public Task<int> ObterQuantidadeDeUsuarioAsync()
        {
            throw new NotImplementedException();
        }

    }
}