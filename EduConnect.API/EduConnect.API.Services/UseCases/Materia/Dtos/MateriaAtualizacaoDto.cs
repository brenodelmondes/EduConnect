using System.ComponentModel.DataAnnotations;

namespace EduConnect.API.Services.UseCases.Materia.Dtos
{
    public class MateriaAtualizacaoDto
    {
        [Required]
        [StringLength(150)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public int CursoId { get; set; }
    }
}
