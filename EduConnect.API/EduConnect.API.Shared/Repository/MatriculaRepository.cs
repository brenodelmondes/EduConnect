using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class MatriculaRepository : IMatriculaRepository
    {
        private readonly AppDbContext _context;

        public MatriculaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Matricula> CriarAsync(Matricula matricula)
        {
            _context.Matriculas.Add(matricula);
            await _context.SaveChangesAsync();
            return matricula;
        }

        public Task<Matricula?> ObterPorIdAsync(int id)
        {
            return _context.Matriculas.FindAsync(id).AsTask();
        }

        public Task<Matricula?> ObterPorIdComVinculosAsync(int id)
        {
            return _context.Matriculas
                .Include(m => m.Aluno)
                    .ThenInclude(a => a.Usuario)
                .Include(m => m.Turma)
                    .ThenInclude(t => t.Materia)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public Task<Matricula?> ObterPorAlunoETurmaAsync(int alunoId, int turmaId)
        {
            return _context.Matriculas
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.AlunoId == alunoId && m.TurmaId == turmaId);
        }

        public async Task<IEnumerable<Matricula>> ObterTodosAsync()
        {
            return await _context.Matriculas
                .Include(m => m.Aluno)
                    .ThenInclude(a => a.Usuario)
                .Include(m => m.Turma)
                    .ThenInclude(t => t.Materia)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Matricula> AtualizarAsync(Matricula matricula)
        {
            _context.Entry(matricula).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return matricula;
        }

        public async Task DeletarAsync(int id)
        {
            var matricula = await _context.Matriculas.FindAsync(id);
            if (matricula != null)
            {
                _context.Matriculas.Remove(matricula);
                await _context.SaveChangesAsync();
            }
        }

        public Task<int> ObterQuantidadeAsync()
        {
            return _context.Matriculas.CountAsync();
        }
    }
}
