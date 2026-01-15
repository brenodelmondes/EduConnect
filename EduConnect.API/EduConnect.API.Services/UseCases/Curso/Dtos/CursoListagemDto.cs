namespace EduConnect.API.Services.UseCases.Curso.Dtos
{
    public class CursoListagemDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }

        public int DepartamentoId { get; set; }
        public string DepartamentoNome { get; set; }

        public int QuantidadeDeMaterias { get; set; }
        public int QuantidadeDeAlunos { get; set; }
    }
}