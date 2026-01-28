using System.ComponentModel.DataAnnotations;

namespace EduConnect.API.Services.UseCases.Matricula.Dtos
{
    public class MatriculaAtualizacaoDto
    {
        [Required]
        public int AlunoId { get; set; }

        [Required]
        public int TurmaId { get; set; }

        public decimal? Ac1 { get; set; }
        public decimal? Ac2 { get; set; }
        public decimal? Ac3 { get; set; }

        public int? Frequencia { get; set; }
    }
}
