using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Usuario.Dtos;
using EduConnect.API.Shared.Repository;
using UsuarioEntity = EduConnect.API.Shared.Entities.Usuario;

namespace EduConnect.API.Services.UseCases.Usuario
{
    public class UsuarioService : IUsuarioService
    {
        private readonly ISuaRepository _suaRepository;
        private readonly TokenService _tokenService;

        public UsuarioService(ISuaRepository suaRepository, TokenService tokenService)
        {
            _suaRepository = suaRepository;
            _tokenService = tokenService;
        }

        public async Task<UsuarioListagemDto> CriarAsync(UsuarioCriacaoDto dto)
        {
            var usuario = new UsuarioEntity
            {
                Nome = dto.Nome,
                Sobrenome = dto.Sobrenome,
                Email = dto.Email,
                Cpf = dto.Cpf,
                PerfilId = dto.PerfilId,
                Senha = BCrypt.Net.BCrypt.HashPassword(dto.Senha)
            };

            var created = await _suaRepository.CriarUsuarioAsync(usuario);
            var loaded = await _suaRepository.UsuarioPorIdComPerfilAsync(created.Id);
            return MapToListagemDto(loaded ?? created);
        }

        public async Task<UsuarioListagemDto?> ObterPorIdAsync(int id)
        {
            var usuario = await _suaRepository.UsuarioPorIdComPerfilAsync(id);
            if (usuario == null) return null;
            return MapToListagemDto(usuario);
        }

        public async Task<IEnumerable<UsuarioListagemDto>> ListarAsync()
        {
            var usuarios = await _suaRepository.ObterTodosUsuariosAsync();
            return usuarios.Select(u => MapToListagemDto(u));
        }

        public async Task<UsuarioListagemDto> AtualizarAsync(int id, UsuarioAtualizacaoDto dto)
        {
            var existente = await _suaRepository.UsuarioPorIdAsync(id);
            if (existente == null)
            {
                throw new ArgumentException("Usuário não encontrado.");
            }

            existente.Nome = dto.Nome;
            existente.Sobrenome = dto.Sobrenome;
            existente.Email = dto.Email;
            existente.Cpf = dto.Cpf;
            existente.PerfilId = dto.PerfilId;

            if (!string.IsNullOrWhiteSpace(dto.Senha))
            {
                existente.Senha = BCrypt.Net.BCrypt.HashPassword(dto.Senha);
            }

            await _suaRepository.AtualizarUsuarioAsync(existente);

            var loaded = await _suaRepository.UsuarioPorIdComPerfilAsync(existente.Id);
            return MapToListagemDto(loaded ?? existente);
        }

        public Task DeletarAsync(int id)
        {
            return _suaRepository.DeletarUsuarioAsync(id);
        }

        public Task<int> ObterQuantidadeDeUsuariosAsync()
        {
            return _suaRepository.ObterQuantidadeDeUsuarioAsync();
        }

        public async Task<LoginResultDto?> LoginAsync(LoginDto dto)
        {
            var email = (dto.Email ?? string.Empty).Trim().ToLowerInvariant();

            var usuario = await _suaRepository.UsuarioPorEmailAsync(email);
            if (usuario == null)
            {
                return null;
            }

            var senhaDigitada = (dto.Senha ?? string.Empty).Trim();
            var senhaArmazenada = usuario.Senha ?? string.Empty;

            if (string.IsNullOrWhiteSpace(senhaArmazenada))
            {
                return null;
            }

            var looksLikeBcrypt = senhaArmazenada.StartsWith("$2a$")
                || senhaArmazenada.StartsWith("$2b$")
                || senhaArmazenada.StartsWith("$2y$")
                || senhaArmazenada.StartsWith("$2$");

            bool ok;
            if (!looksLikeBcrypt)
            {
                return null;
            }

            try
            {
                ok = BCrypt.Net.BCrypt.Verify(senhaDigitada, senhaArmazenada);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                return null;
            }

            if (!ok)
            {
                return null;
            }

            var token = _tokenService.GenerateToken(usuario);

            return new LoginResultDto
            {
                Token = token,
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                PerfilId = usuario.PerfilId,
                PerfilNome = usuario.Perfil?.Nome ?? string.Empty
            };
        }

        private static UsuarioListagemDto MapToListagemDto(UsuarioEntity u)
        {
            return new UsuarioListagemDto
            {
                Id = u.Id,
                Nome = u.Nome,
                Sobrenome = u.Sobrenome,
                Email = u.Email,
                Cpf = u.Cpf,
                PerfilId = u.PerfilId,
                PerfilNome = u.Perfil?.Nome
            };
        }
    }
}