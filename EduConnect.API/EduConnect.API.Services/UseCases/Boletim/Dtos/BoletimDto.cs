using System;
using System.Collections.Generic;

namespace EduConnect.API.Services.UseCases.Boletim.Dtos
{
    public class BoletimDto
    {
        public int AlunoId { get; set; }
        public string AlunoNome { get; set; } = string.Empty;
        public string Ra { get; set; } = string.Empty;
        public string Curso { get; set; } = string.Empty;
        public string Semestre { get; set; } = string.Empty;
        public decimal? MediaGeralDoSemestre { get; set; }
        public List<BoletimDisciplinaDto> Disciplinas { get; set; } = new();
        public DateTime GeradoEm { get; set; } = DateTime.UtcNow;
    }
}
