using System.ComponentModel.DataAnnotations;

namespace EduConnect.API.Services.UseCases.Departamento.Dtos
{
    public class DepartamentoCriacaoDto
    {
        [Required]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;
    }
}