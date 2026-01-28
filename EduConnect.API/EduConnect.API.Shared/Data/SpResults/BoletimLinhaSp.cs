namespace EduConnect.API.Shared.Data.SpResults
{
    public class BoletimLinhaSp
    {
        public int AlunoId { get; set; }
        public string AlunoNome { get; set; } = string.Empty;
        public string AlunoSobrenome { get; set; } = string.Empty;
        public string AlunoRa { get; set; } = string.Empty;
        public string CursoNome { get; set; } = string.Empty;
        public string Semestre { get; set; } = string.Empty;
        public string MateriaNome { get; set; } = string.Empty;
        public int TurmaId { get; set; }
        public decimal? Ac1 { get; set; }
        public decimal? Ac2 { get; set; }
        public decimal? Ac3 { get; set; }
        public decimal? MediaFinal { get; set; }
        public int? Frequencia { get; set; }
        public int ProfessorId { get; set; }
        public string ProfessorTitulacao { get; set; } = string.Empty;
        public string ProfessorNome { get; set; } = string.Empty;
        public string ProfessorSobrenome { get; set; } = string.Empty;
    }
}
