using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/inscricoes")]
    public class InscricoesController : ControllerBase
    {
        private static readonly ConcurrentDictionary<string, InscricaoState> _state = new();

        [AllowAnonymous]
        [HttpPost]
        [ProducesResponseType(typeof(InscricaoResponse), 200)]
        [ProducesResponseType(400)]
        public IActionResult Criar([FromBody] InscricaoRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var correlationId = Guid.NewGuid().ToString("N");
            var status = "RECEBIDA";

            _state[correlationId] = new InscricaoState
            {
                CorrelationId = correlationId,
                Status = status,
                Email = request.Email,
                EmailTemplate = string.IsNullOrWhiteSpace(request.EmailTemplate) ? "DEFAULT" : request.EmailTemplate,
                CreatedAt = DateTime.UtcNow,
                LastSentAt = DateTime.UtcNow,
            };

            return Ok(new InscricaoResponse
            {
                CorrelationId = correlationId,
                Status = status,
            });
        }

        [AllowAnonymous]
        [HttpGet("{correlationId}/status")]
        [ProducesResponseType(typeof(InscricaoResponse), 200)]
        [ProducesResponseType(404)]
        public IActionResult ObterStatus(string correlationId)
        {
            if (!_state.TryGetValue(correlationId, out var state))
            {
                return NotFound("Inscrição não encontrada.");
            }

            return Ok(new InscricaoResponse
            {
                CorrelationId = state.CorrelationId,
                Status = state.Status,
            });
        }

        [AllowAnonymous]
        [HttpPost("{correlationId}/reenviar-email")]
        [ProducesResponseType(typeof(InscricaoResponse), 200)]
        [ProducesResponseType(404)]
        public IActionResult ReenviarEmail(string correlationId)
        {
            if (!_state.TryGetValue(correlationId, out var state))
            {
                return NotFound("Inscrição não encontrada.");
            }

            state.LastSentAt = DateTime.UtcNow;
            state.Status = "EMAIL_REENVIADO";

            return Ok(new InscricaoResponse
            {
                CorrelationId = state.CorrelationId,
                Status = state.Status,
            });
        }

        public class InscricaoRequest
        {
            [Required]
            [StringLength(120, MinimumLength = 5)]
            public string FullName { get; set; } = string.Empty;

            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required]
            [StringLength(30, MinimumLength = 8)]
            public string Phone { get; set; } = string.Empty;

            [Required]
            [RegularExpression("ADS|SI|CCO|ENG")]
            public string Course { get; set; } = string.Empty;

            public string? EmailTemplate { get; set; }
        }

        public class InscricaoResponse
        {
            public string Status { get; set; } = string.Empty;
            public string CorrelationId { get; set; } = string.Empty;
        }

        private class InscricaoState
        {
            public string CorrelationId { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string EmailTemplate { get; set; } = string.Empty;
            public DateTime CreatedAt { get; set; }
            public DateTime LastSentAt { get; set; }
        }
    }
}
