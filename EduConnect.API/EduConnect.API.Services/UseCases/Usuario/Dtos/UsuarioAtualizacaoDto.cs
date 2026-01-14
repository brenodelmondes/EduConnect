using System.ComponentModel.DataAnnotations;

namespace EduConnect.API.Services.UseCases.Usuario.Dtos
{
    public class UsuarioAtualizacaoDto
    {
        [Required]
        [StringLength(50)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Sobrenome { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        // Senha opcional (se vier, será atualizada)
        public string? Senha { get; set; }

        [Required]
        [StringLength(11)]
        public string Cpf { get; set; } = string.Empty;

        [Required]
        public int PerfilId { get; set; }
    }
}
