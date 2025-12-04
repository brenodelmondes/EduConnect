using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Usuario;
using EduConnect.API.Shared.Repository;
using Microsoft.AspNetCore.Mvc;
using UsuarioEntity = EduConnect.API.Shared.Entities.Usuario;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuariosController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UsuarioEntity>), 200)]
        public async Task<IActionResult> Listar()
        {
            var usuarios = await _usuarioService.ListarAsync();
            return Ok(usuarios);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(UsuarioEntity), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var usuario = await _usuarioService.ObterPorIdAsync(id);
            if (usuario == null)
            {
                return NotFound("Usuário não encontrado.");
            }
            return Ok(usuario);
        }

        [HttpPost]
        [ProducesResponseType(typeof(UsuarioEntity), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Criar([FromBody] UsuarioEntity usuario)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novoUsuario = await _usuarioService.CriarAsync(usuario);

            // Se sua entidade não tem Id, mude para return Ok(novoUsuario);
            return CreatedAtAction(nameof(ObterPorId), new { id = GetId(novoUsuario) }, novoUsuario);
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] UsuarioEntity usuario)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Dados inválidos.");
            }

            var existente = await _usuarioService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Usuário não encontrado.");
            }

            await _usuarioService.AtualizarAsync(id, usuario);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deletar(int id)
        {
            var existente = await _usuarioService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Usuário não encontrado.");
            }

            await _usuarioService.DeletarAsync(id);
            return NoContent();
        }

        // Helper para recuperar Id se a entidade o possuir
        private static int? GetId(UsuarioEntity usuario)
        {
            var prop = typeof(UsuarioEntity).GetProperty("Id");
            return prop != null ? (int?)prop.GetValue(usuario) : null;
        }
    }
}