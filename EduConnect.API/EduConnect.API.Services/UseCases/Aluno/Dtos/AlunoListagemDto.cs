namespace EduConnect.API.Services.UseCases.Aluno.Dtos
{
    public class AlunoListagemDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string UsuarioNome { get; set; } = string.Empty;
        public string UsuarioEmail { get; set; } = string.Empty;
        public string Ra { get; set; } = string.Empty;
        public int CursoId { get; set; }
        public string CursoNome { get; set; } = string.Empty;
    }
}
