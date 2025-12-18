using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Usuario.Dtos;

namespace EduConnect.API.Services.UseCases.Usuario
{
    public interface IUsuarioService
    {
        Task<UsuarioListagemDto> CriarAsync(UsuarioCriacaoDto dto);
        Task<UsuarioListagemDto?> ObterPorIdAsync(int id);
        Task<IEnumerable<UsuarioListagemDto>> ListarAsync();
        Task<UsuarioListagemDto> AtualizarAsync(int id, UsuarioAtualizacaoDto dto);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeDeUsuariosAsync();
        Task<LoginResultDto?> LoginAsync(LoginDto dto);
    }
}