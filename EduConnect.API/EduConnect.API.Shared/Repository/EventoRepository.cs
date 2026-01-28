using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class EventoRepository : IEventoRepository
    {
        private readonly AppDbContext _context;

        public EventoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Evento> CriarAsync(Evento evento)
        {
            _context.Eventos.Add(evento);
            await _context.SaveChangesAsync();
            return evento;
        }

        public Task<Evento?> ObterPorIdAsync(int id)
        {
            return _context.Eventos.FindAsync(id).AsTask();
        }

        public Task<Evento?> ObterPorIdComVinculosAsync(int id)
        {
            return _context.Eventos
                .Include(e => e.Usuario)
                .Include(e => e.Turma)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<IEnumerable<Evento>> ObterTodosAsync()
        {
            return await _context.Eventos
                .Include(e => e.Usuario)
                .Include(e => e.Turma)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Evento> AtualizarAsync(Evento evento)
        {
            _context.Entry(evento).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return evento;
        }

        public async Task DeletarAsync(int id)
        {
            var evento = await _context.Eventos.FindAsync(id);
            if (evento != null)
            {
                _context.Eventos.Remove(evento);
                await _context.SaveChangesAsync();
            }
        }

        public Task<int> ObterQuantidadeAsync()
        {
            return _context.Eventos.CountAsync();
        }
    }
}
