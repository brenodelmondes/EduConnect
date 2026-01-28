using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Boletim;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/boletins")]
    [Authorize]
    public class BoletimController : ControllerBase
    {
        private readonly GerarBoletimUseCase _useCase;

        public BoletimController(GerarBoletimUseCase useCase)
        {
            _useCase = useCase;
        }

        [HttpGet("alunos/{alunoId:int}/semestres/{semestre}/pdf")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> BaixarPdf(int alunoId, string semestre)
        {
            var pdfBytes = await _useCase.ExecutarAsync(alunoId, semestre);
            return File(pdfBytes, "application/pdf", "boletim.pdf");
        }
    }
}
