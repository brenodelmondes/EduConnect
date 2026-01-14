using EduConnect.API.Shared.Entities;
using EduConnect.API.Shared.Repository;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic; 
using System.Threading.Tasks; 
using EduConnect.API.Shared.Entities; 
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Repository
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly AppDbContext _context;
        public UsuarioRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Usuario> CriarAsync(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public Task<Usuario?> ObterPorIdAsync(int id)
        {
            return _context.Usuarios.FindAsync(id).AsTask();
        }

        public Task<Usuario?> ObterPorIdComPerfilAsync(int id)
        {
            return _context.Usuarios
                .Include(u => u.Perfil)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public Task<Usuario?> ObterPorEmailAsync(string email)
        {
            var normalized = (email ?? string.Empty).Trim().ToLower();
            return _context.Usuarios
                .Include(u => u.Perfil)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalized);
        }

        public async Task<IEnumerable<Usuario>> ObterTodosAsync()
        {
            return await _context.Usuarios
                .Include(u => u.Perfil)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Usuario> AtualizarAsync(Usuario usuario)
        {
            _context.Entry(usuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task DeletarAsync(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario != null)
            {
                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();
            }
        }

        public Task<int> ObterQuantidadeAsync()
        {
            return _context.Usuarios.CountAsync();
        }
    }
}