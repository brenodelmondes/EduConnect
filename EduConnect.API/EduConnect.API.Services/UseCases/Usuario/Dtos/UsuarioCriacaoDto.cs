using System.ComponentModel.DataAnnotations;

namespace EduConnect.API.Services.UseCases.Usuario.Dtos
{
    public class UsuarioCriacaoDto
    {
        [Required]
        [StringLength(50)]
        public string Nome { get; set; }
        [Required]
        [StringLength(100)]
        public string Sobrenome { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        [MinLength(6)]
        public string Senha { get; set; }
        [Required]
        [StringLength(11)]
        public string Cpf { get; set; }
        [Required]
        public int PerfilId { get; set; }
    }
}