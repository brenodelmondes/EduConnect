using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Repository;
using UsuarioEntity = EduConnect.API.Shared.Entities.Usuario;

namespace EduConnect.API.Services.UseCases.Usuario
{
    public class UsuarioService : IUsuarioService
    {
        private readonly ISuaRepository _suaRepository;

        public UsuarioService(ISuaRepository suaRepository)
        {
            _suaRepository = suaRepository;
        }

        public Task<UsuarioEntity> CriarAsync(UsuarioEntity usuario)
        {
            // Regras como hashing de senha podem ser aplicadas aqui.
            return _suaRepository.CriarUsuarioAsync(usuario);
        }

        public Task<UsuarioEntity> ObterPorIdAsync(int id)
        {
            return _suaRepository.UsuarioPorIdAsync(id);
        }

        public Task<IEnumerable<UsuarioEntity>> ListarAsync()
        {
            return _suaRepository.ObterTodosUsuariosAsync();
        }

        public Task<UsuarioEntity> AtualizarAsync(int id, UsuarioEntity usuario)
        {
            if (id != usuario?.GetType().GetProperty("Id")?.GetValue(usuario) as int? && usuario is not null)
            {
                throw new ArgumentException("O ID do usuário na rota não corresponde ao ID no corpo da requisição.");
            }
            return _suaRepository.AtualizarUsuarioAsync(usuario);
        }

        public Task DeletarAsync(int id)
        {
            return _suaRepository.DeletarUsuarioAsync(id);
        }

        public Task<int> ObterQuantidadeDeUsuariosAsync()
        {
            return _suaRepository.ObterQuantidadeDeUsuarioAsync();
        }
    }
}