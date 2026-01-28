using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class AlunoRepository : IAlunoRepository
    {
        private readonly AppDbContext _context;

        public AlunoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Aluno> CriarAsync(Aluno aluno)
        {
            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();
            return aluno;
        }

        public Task<Aluno?> ObterPorIdAsync(int id)
        {
            return _context.Alunos.FindAsync(id).AsTask();
        }

        public Task<Aluno?> ObterPorIdComVinculosAsync(int id)
        {
            return _context.Alunos
                .Include(a => a.Usuario)
                .Include(a => a.Curso)
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Aluno>> ObterTodosAsync()
        {
            return await _context.Alunos
                .Include(a => a.Usuario)
                .Include(a => a.Curso)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Aluno> AtualizarAsync(Aluno aluno)
        {
            _context.Entry(aluno).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return aluno;
        }

        public async Task DeletarAsync(int id)
        {
            var aluno = await _context.Alunos.FindAsync(id);
            if (aluno != null)
            {
                _context.Alunos.Remove(aluno);
                await _context.SaveChangesAsync();
            }
        }

        public Task<int> ObterQuantidadeAsync()
        {
            return _context.Alunos.CountAsync();
        }
    }
}
