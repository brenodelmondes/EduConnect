namespace EduConnect.API.Services.UseCases.Matricula.Dtos
{
    public class MatriculaListagemDto
    {
        public int Id { get; set; }
        public int AlunoId { get; set; }
        public string AlunoRa { get; set; } = string.Empty;
        public int TurmaId { get; set; }
        public string TurmaSemestre { get; set; } = string.Empty;
        public decimal? Ac1 { get; set; }
        public decimal? Ac2 { get; set; }
        public decimal? Ac3 { get; set; }
        public decimal? MediaFinal { get; set; }
        public int? Frequencia { get; set; }
    }
}
