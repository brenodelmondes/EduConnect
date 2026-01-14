using System.ComponentModel.DataAnnotations;

namespace EduConnect.API.Services.UseCases.Usuario.Dtos
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Senha { get; set; }
    }
}