namespace EduConnect.API.Shared.Data.SpResults
{
    public class DashboardResumoSp
    {
        public int TotalAlunos { get; set; }
        public int TotalProfessores { get; set; }
        public int TotalTurmas { get; set; }
        public decimal? MediaGeralDasMediasFinais { get; set; }
        public decimal? PercentualAprovados { get; set; }
        public decimal? PercentualReprovados { get; set; }
    }
}
