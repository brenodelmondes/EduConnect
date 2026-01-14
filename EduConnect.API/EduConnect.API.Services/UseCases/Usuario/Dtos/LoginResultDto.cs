namespace EduConnect.API.Services.UseCases.Usuario.Dtos
{
    public class LoginResultDto
    {
        public string Token { get; set; } = string.Empty;
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int PerfilId { get; set; }
        public string PerfilNome { get; set; } = string.Empty;
    }
}
