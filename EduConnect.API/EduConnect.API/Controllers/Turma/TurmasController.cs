using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Turma;
using EduConnect.API.Services.UseCases.Turma.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    [Authorize]
    public class TurmasController : ControllerBase
    {
        private readonly ITurmaService _turmaService;

        public TurmasController(ITurmaService turmaService)
        {
            _turmaService = turmaService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<TurmaListagemDto>), 200)]
        public async Task<IActionResult> Listar()
        {
            var turmas = await _turmaService.ListarAsync();
            return Ok(turmas);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(TurmaListagemDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var turma = await _turmaService.ObterPorIdAsync(id);
            if (turma == null)
            {
                return NotFound("Turma não encontrada.");
            }

            return Ok(turma);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(TurmaListagemDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Criar([FromBody] TurmaCriacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novo = await _turmaService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = novo.Id }, novo);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(TurmaListagemDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] TurmaAtualizacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Dados inválidos.");
            }

            var existente = await _turmaService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Turma não encontrada.");
            }

            var atualizado = await _turmaService.AtualizarAsync(id, dto);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deletar(int id)
        {
            var existente = await _turmaService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Turma não encontrada.");
            }

            await _turmaService.DeletarAsync(id);
            return NoContent();
        }
    }
}
