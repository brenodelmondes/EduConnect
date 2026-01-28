using System.ComponentModel.DataAnnotations;

namespace EduConnect.API.Services.UseCases.Aluno.Dtos
{
    public class AlunoAtualizacaoDto
    {
        [Required]
        public int UsuarioId { get; set; }

        [Required]
        [StringLength(20)]
        public string Ra { get; set; } = string.Empty;

        [Required]
        public int CursoId { get; set; }
    }
}
