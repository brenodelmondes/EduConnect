using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UsuarioEntity = EduConnect.API.Shared.Entities.Usuario;

namespace EduConnect.API.Services.UseCases.Usuario
{
    public interface IUsuarioService
    {
        Task<UsuarioEntity> CriarAsync(UsuarioEntity usuario);
        Task<UsuarioEntity> ObterPorIdAsync(int id);
        Task<IEnumerable<UsuarioEntity>> ListarAsync();
        Task<UsuarioEntity> AtualizarAsync(int id, UsuarioEntity usuario);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeDeUsuariosAsync();
    }
}