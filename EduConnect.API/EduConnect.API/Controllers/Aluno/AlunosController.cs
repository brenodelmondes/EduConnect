using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Aluno;
using EduConnect.API.Services.UseCases.Aluno.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    [Authorize]
    public class AlunosController : ControllerBase
    {
        private readonly IAlunoService _alunoService;

        public AlunosController(IAlunoService alunoService)
        {
            _alunoService = alunoService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<AlunoListagemDto>), 200)]
        public async Task<IActionResult> Listar()
        {
            var alunos = await _alunoService.ListarAsync();
            return Ok(alunos);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(AlunoListagemDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var aluno = await _alunoService.ObterPorIdAsync(id);
            if (aluno == null)
            {
                return NotFound("Aluno não encontrado.");
            }

            return Ok(aluno);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(AlunoListagemDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Criar([FromBody] AlunoCriacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novo = await _alunoService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = novo.Id }, novo);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(typeof(AlunoListagemDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] AlunoAtualizacaoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Dados inválidos.");
            }

            var existente = await _alunoService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Aluno não encontrado.");
            }

            var atualizado = await _alunoService.AtualizarAsync(id, dto);
            return Ok(atualizado);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Administrador")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Deletar(int id)
        {
            var existente = await _alunoService.ObterPorIdAsync(id);
            if (existente == null)
            {
                return NotFound("Aluno não encontrado.");
            }

            await _alunoService.DeletarAsync(id);
            return NoContent();
        }
    }
}
