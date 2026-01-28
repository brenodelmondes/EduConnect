using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Departamento;
using EduConnect.API.Services.UseCases.Departamento.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    [Authorize]
    public class DepartamentosController : ControllerBase
    {
        private readonly IDepartamentoService _departamentoService;

        public DepartamentosController(IDepartamentoService departamentoService)
        {
            _departamentoService = departamentoService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<DepartamentoListagemDto>), 200)]
        public async Task<IActionResult> Listar()
        {
            var departamentos = await _departamentoService.ListarAsync();
            return Ok(departamentos);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(DepartamentoListagemDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var departamento = await _departamentoService.ObterPorIdAsync(id);
            if (departamento == null)
            {
                return NotFound("Departamento não encontrado.");
            }

            return Ok(departamento);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(DepartamentoListagemDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Criar([FromBody] DepartamentoCriacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novo = await _departamentoService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = novo.Id }, novo);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(DepartamentoListagemDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] DepartamentoAtualizacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Dados inválidos.");
            }

            var existente = await _departamentoService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Departamento não encontrado.");
            }

            var atualizado = await _departamentoService.AtualizarAsync(id, dto);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deletar(int id)
        {
            var existente = await _departamentoService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Departamento não encontrado.");
            }

            await _departamentoService.DeletarAsync(id);
            return NoContent();
        }
    }
}
