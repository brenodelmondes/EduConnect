using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Evento;
using EduConnect.API.Services.UseCases.Evento.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    [Authorize]
    public class EventosController : ControllerBase
    {
        private readonly IEventoService _eventoService;

        public EventosController(IEventoService eventoService)
        {
            _eventoService = eventoService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<EventoListagemDto>), 200)]
        public async Task<IActionResult> Listar()
        {
            var eventos = await _eventoService.ListarAsync();
            return Ok(eventos);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(EventoListagemDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var evento = await _eventoService.ObterPorIdAsync(id);
            if (evento == null)
            {
                return NotFound("Evento não encontrado.");
            }

            return Ok(evento);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(EventoListagemDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Criar([FromBody] EventoCriacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novo = await _eventoService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = novo.Id }, novo);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(EventoListagemDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] EventoAtualizacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Dados inválidos.");
            }

            var existente = await _eventoService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Evento não encontrado.");
            }

            var atualizado = await _eventoService.AtualizarAsync(id, dto);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deletar(int id)
        {
            var existente = await _eventoService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Evento não encontrado.");
            }

            await _eventoService.DeletarAsync(id);
            return NoContent();
        }
    }
}
