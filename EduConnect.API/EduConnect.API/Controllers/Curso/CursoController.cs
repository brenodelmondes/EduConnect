using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Curso;
using EduConnect.API.Services.UseCases.Curso.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    [Authorize]
    public class CursosController : ControllerBase
    {
        private readonly ICursoService _cursoService;

        public CursosController(ICursoService cursoService)
        {
            _cursoService = cursoService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CursoListagemDto>), 200)]
        public async Task<IActionResult> Listar()
        {
            var cursos = await _cursoService.ListarAsync();
            return Ok(cursos);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(CursoListagemDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var curso = await _cursoService.ObterPorIdAsync(id);
            if (curso == null)
            {
                return NotFound("Curso não encontrado.");
            }

            return Ok(curso);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(CursoListagemDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Criar([FromBody] CursoCriacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novo = await _cursoService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = novo.Id }, novo);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(CursoListagemDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] CursoAtualizacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Dados inválidos.");
            }

            var existente = await _cursoService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Curso não encontrado.");
            }

            var atualizado = await _cursoService.AtualizarAsync(id, dto);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deletar(int id)
        {
            var existente = await _cursoService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Curso não encontrado.");
            }

            await _cursoService.DeletarAsync(id);
            return NoContent();
        }
    }
}
