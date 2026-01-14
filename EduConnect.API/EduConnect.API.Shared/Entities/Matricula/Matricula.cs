using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduConnect.API.Shared.Entities
{
    public class Matricula
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int AlunoId { get; set; }

        [Required]
        public int TurmaId { get; set; }

        [Column(TypeName = "decimal(4,2)")]
        public decimal? Ac1 { get; set; }

        [Column(TypeName = "decimal(4,2)")]
        public decimal? Ac2 { get; set; }

        [Column(TypeName = "decimal(4,2)")]
        public decimal? Ac3 { get; set; }

        [Column(TypeName = "decimal(4,2)")]
        public decimal? MediaFinal { get; set; }

        public int? Frequencia { get; set; }

        public Aluno Aluno { get; set; }
        public Turma Turma { get; set; }
    }
}