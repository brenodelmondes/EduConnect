namespace EduConnect.API.Services.UseCases.Turma.Dtos
{
    public class TurmaListagemDto
    {
        public int Id { get; set; }
        public int MateriaId { get; set; }
        public string MateriaNome { get; set; } = string.Empty;
        public int ProfessorId { get; set; }
        public string ProfessorNome { get; set; } = string.Empty;
        public string Semestre { get; set; } = string.Empty;
        public string Local { get; set; } = string.Empty;
    }
}
