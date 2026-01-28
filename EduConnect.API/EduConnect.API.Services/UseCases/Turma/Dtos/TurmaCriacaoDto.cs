using System.ComponentModel.DataAnnotations;

namespace EduConnect.API.Services.UseCases.Turma.Dtos
{
    public class TurmaCriacaoDto
    {
        [Required]
        public int MateriaId { get; set; }

        [Required]
        public int ProfessorId { get; set; }

        [Required]
        [StringLength(10)]
        public string Semestre { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Local { get; set; } = string.Empty;
    }
}
