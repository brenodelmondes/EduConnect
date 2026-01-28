using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Materia;
using EduConnect.API.Services.UseCases.Materia.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    [Authorize]
    public class MateriasController : ControllerBase
    {
        private readonly IMateriaService _materiaService;

        public MateriasController(IMateriaService materiaService)
        {
            _materiaService = materiaService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<MateriaListagemDto>), 200)]
        public async Task<IActionResult> Listar()
        {
            var materias = await _materiaService.ListarAsync();
            return Ok(materias);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(MateriaListagemDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var materia = await _materiaService.ObterPorIdAsync(id);
            if (materia == null)
            {
                return NotFound("Matéria não encontrada.");
            }

            return Ok(materia);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(MateriaListagemDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Criar([FromBody] MateriaCriacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novo = await _materiaService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = novo.Id }, novo);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(MateriaListagemDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] MateriaAtualizacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Dados inválidos.");
            }

            var existente = await _materiaService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Matéria não encontrada.");
            }

            var atualizado = await _materiaService.AtualizarAsync(id, dto);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deletar(int id)
        {
            var existente = await _materiaService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Matéria não encontrada.");
            }

            await _materiaService.DeletarAsync(id);
            return NoContent();
        }
    }
}
