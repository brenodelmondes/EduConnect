using System.ComponentModel.DataAnnotations;

namespace EduConnect.API.Services.UseCases.Usuario.Dtos
{
    public class UsuarioListagemDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Sobrenome { get; set; }
        public string Email { get; set; }
        public string Cpf { get; set; }
        public int PerfilId { get; set; }
        public string PerfilNome { get; set; }
    }
}