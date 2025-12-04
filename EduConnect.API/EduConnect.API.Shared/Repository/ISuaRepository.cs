using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;
using EduConnect.API.Shared.Entities.Professor;

namespace EduConnect.API.Shared.Repository
{
    public interface ISuaRepository
    {
        // Professor
        Task<Professor> CriarProfessorAsync(Professor professor);
        Task<Professor> ProfessorPorIdAsync(int id);
        Task<IEnumerable<Professor>> ObterTodosProfessoresAsync();
        Task<Professor> AtualizarProfessorAsync(Professor professor);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeProfessoresAsync();

        // Usuario
        Task<Usuario> CriarUsuarioAsync(Usuario usuario);
        Task<Usuario> UsuarioPorIdAsync(int id);
        Task<IEnumerable<Usuario>> ObterTodosUsuariosAsync();
        Task<Usuario> AtualizarUsuarioAsync(Usuario usuario);
        Task DeletarUsuarioAsync(int id);
        Task<int> ObterQuantidadeDeUsuarioAsync();
    }
}
