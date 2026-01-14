using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Tracing;

namespace EduConnect.API.Shared.Entities
{
    public class Evento
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Titulo { get; set; }

        [Required]
        public DateTime DataEvento { get; set; }

        [Required]
        [StringLength(50)]
        public string Tipo { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [Required]
        public EventoScope Scope { get; set; }

        public int? TurmaId { get; set; }

        public Usuario Usuario { get; set; }
        public Turma Turma { get; set; }
    }
}