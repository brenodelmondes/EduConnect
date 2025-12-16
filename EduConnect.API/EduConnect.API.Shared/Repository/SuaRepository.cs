using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public class SuaRepository : ISuaRepository
    {
        private readonly AppDbContext _context;

        public SuaRepository(AppDbContext context)
        {
            _context = context;
        }

        // Professor
        public async Task<Professor> CriarProfessorAsync(Professor professor)
        {
            _context.Professores.Add(professor);
            await _context.SaveChangesAsync();
            return professor;
        }

        public Task<Professor> ProfessorPorIdAsync(int id)
        {
            return _context.Professores.FindAsync(id).AsTask();
        }

        public async Task<IEnumerable<Professor>> ObterTodosProfessoresAsync()
        {
            return await _context.Professores.AsNoTracking().ToListAsync();
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

        public async Task<int> ObterQuantidadeProfessoresAsync()
        {
            return await _context.Professores.CountAsync();
        }

        // Usuario
        public async Task<Usuario> CriarUsuarioAsync(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public Task<Usuario> UsuarioPorIdAsync(int id)
        {
            return _context.Usuarios.FindAsync(id).AsTask();
        }

        public async Task<IEnumerable<Usuario>> ObterTodosUsuariosAsync()
        {
            return await _context.Usuarios.Include(u => u.Perfil).AsNoTracking().ToListAsync();
        }

        public async Task<Usuario> AtualizarUsuarioAsync(Usuario usuario)
        {
            _context.Entry(usuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task DeletarUsuarioAsync(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario != null)
            {
                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> ObterQuantidadeDeUsuarioAsync()
        {
            return await _context.Usuarios.CountAsync();
        }
    }
}