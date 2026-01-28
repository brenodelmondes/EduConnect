using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Matricula;
using EduConnect.API.Services.UseCases.Matricula.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    [Authorize]
    public class MatriculasController : ControllerBase
    {
        private readonly IMatriculaService _matriculaService;

        public MatriculasController(IMatriculaService matriculaService)
        {
            _matriculaService = matriculaService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<MatriculaListagemDto>), 200)]
        public async Task<IActionResult> Listar()
        {
            var matriculas = await _matriculaService.ListarAsync();
            return Ok(matriculas);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(MatriculaListagemDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var matricula = await _matriculaService.ObterPorIdAsync(id);
            if (matricula == null)
            {
                return NotFound("Matrícula não encontrada.");
            }

            return Ok(matricula);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(MatriculaListagemDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Criar([FromBody] MatriculaCriacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novo = await _matriculaService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = novo.Id }, novo);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(MatriculaListagemDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] MatriculaAtualizacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Dados inválidos.");
            }

            var existente = await _matriculaService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Matrícula não encontrada.");
            }

            var atualizado = await _matriculaService.AtualizarAsync(id, dto);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deletar(int id)
        {
            var existente = await _matriculaService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Matrícula não encontrada.");
            }

            await _matriculaService.DeletarAsync(id);
            return NoContent();
        }
    }
}
