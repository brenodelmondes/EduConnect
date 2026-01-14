using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Shared.Repository
{
    public interface IUsuarioRepository
    {
        Task<Usuario> CriarAsync(Usuario usuario);
        Task<Usuario?> ObterPorIdAsync(int id);
        Task<Usuario?> ObterPorIdComPerfilAsync(int id);
        Task<Usuario?> ObterPorEmailAsync(string email);
        Task<IEnumerable<Usuario>> ObterTodosAsync();
        Task<Usuario> AtualizarAsync(Usuario usuario);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeAsync();
    }
}