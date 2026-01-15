using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class DepartamentoRepository : IDepartamentoRepository
    {
        private readonly AppDbContext _context;

        public DepartamentoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Departamento> CriarAsync(Departamento departamento)
        {
            _context.Departamentos.Add(departamento);
            await _context.SaveChangesAsync();
            return departamento;
        }

        public Task<Departamento?> ObterPorIdAsync(int id)
        {
            return _context.Departamentos.FindAsync(id).AsTask();
        }

        public Task<Departamento?> ObterPorIdComCursosAsync(int id)
        {
            return _context.Departamentos
                .Include(d => d.Cursos)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<Departamento>> ObterTodosAsync()
        {
            return await _context.Departamentos
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Departamento> AtualizarAsync(Departamento departamento)
        {
            _context.Entry(departamento).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return departamento;
        }

        public async Task DeletarAsync(int id)
        {
            var departamento = await _context.Departamentos.FindAsync(id);
            if (departamento != null)
            {
                _context.Departamentos.Remove(departamento);
                await _context.SaveChangesAsync();
            }
        }

        public Task<int> ObterQuantidadeAsync()
        {
            return _context.Departamentos.CountAsync();
        }
    }
}