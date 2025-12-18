using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Usuario;
using EduConnect.API.Services.UseCases.Usuario.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    [Authorize]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuariosController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UsuarioListagemDto>), 200)]
        public async Task<IActionResult> Listar()
        {
            var usuarios = await _usuarioService.ListarAsync();
            return Ok(usuarios);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(UsuarioListagemDto), 200)]
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
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(UsuarioListagemDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Criar([FromBody] UsuarioCriacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novoUsuario = await _usuarioService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = novoUsuario.Id }, novoUsuario);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] UsuarioAtualizacaoDto dto)
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

            var atualizado = await _usuarioService.AtualizarAsync(id, dto);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Administrador")]
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
    }
}