namespace EduConnect.API.Services.UseCases.Boletim.Dtos
{
    public class BoletimDisciplinaDto
    {
        public string Materia { get; set; } = string.Empty;
        public string Professor { get; set; } = string.Empty;
        public decimal? Ac1 { get; set; }
        public decimal? Ac2 { get; set; }
        public decimal? Ac3 { get; set; }
        public decimal? MediaFinal { get; set; }
        public int? Frequencia { get; set; }
        public string Situacao { get; set; } = string.Empty;
    }
}
