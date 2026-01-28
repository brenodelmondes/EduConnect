namespace EduConnect.API.Services.UseCases.Materia.Dtos
{
    public class MateriaListagemDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int CursoId { get; set; }
        public string CursoNome { get; set; } = string.Empty;
    }
}
