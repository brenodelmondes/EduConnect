using System.ComponentModel.DataAnnotations;

namespace EduConnect.API.Services.UseCases.Curso.Dtos
{
    public class CursoAtualizacaoDto
    {
        [Required]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public int DepartamentoId { get; set; }
    }
}