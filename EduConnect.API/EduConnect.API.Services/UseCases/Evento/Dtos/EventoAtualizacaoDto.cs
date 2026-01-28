using System;
using System.ComponentModel.DataAnnotations;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Services.UseCases.Evento.Dtos
{
    public class EventoAtualizacaoDto
    {
        [Required]
        [StringLength(200)]
        public string Titulo { get; set; } = string.Empty;

        [Required]
        public DateTime DataEvento { get; set; }

        [Required]
        [StringLength(50)]
        public string Tipo { get; set; } = string.Empty;

        [Required]
        public int UsuarioId { get; set; }

        [Required]
        public EventoScope Scope { get; set; }

        public int? TurmaId { get; set; }
    }
}
