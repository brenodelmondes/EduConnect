using EduConnect.API.Services.UseCases.Professor;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

using ProfessorEntity = EduConnect.API.Shared.Entities.Professor;

namespace EduConnect.API.Controllers.Professor
{
    [ApiController]
    [Route("/[controller]")]
    public class ProfessorController : ControllerBase
    {
        private readonly IProfessorService _professorService;

        public ProfessorController(IProfessorService professorService)
        {
            _professorService = professorService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProfessorEntity>), 200)]
        public async Task<IActionResult> Listar()
        {
            var professores = await _professorService.ListarAsync();
            return Ok(professores);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ProfessorEntity), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var professor = await _professorService.ObterPorIdAsync(id);
            if (professor == null)
            {
                return NotFound("Professor não encontrado.");
            }
            return Ok(professor);
        }

        [HttpPost]
        [ProducesResponseType(typeof(ProfessorEntity), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Criar([FromBody] ProfessorEntity professor)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novoProfessor = await _professorService.CriarAsync(professor);
            return CreatedAtAction(nameof(ObterPorId), new { id = novoProfessor.Id }, novoProfessor);
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] ProfessorEntity professor)
        {
            if (!ModelState.IsValid || id != professor.Id)
            {
                return BadRequest("Dados inválidos.");
            }

            var professorExistente = await _professorService.ObterPorIdAsync(id);
            if (professorExistente == null)
            {
                return NotFound("Professor não encontrado.");
            }

            await _professorService.AtualizarAsync(id, professor);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deletar(int id)
        {
            var professorExistente = await _professorService.ObterPorIdAsync(id);
            if (professorExistente == null)
            {
                return NotFound("Professor não encontrado.");
            }

            await _professorService.DeletarAsync(id);
            return NoContent();
        }
    }
}