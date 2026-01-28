using EduConnect.API.Services.UseCases.Boletim.Dtos;

namespace EduConnect.API.Services.UseCases.Boletim
{
    public interface IBoletimPdfGenerator
    {
        byte[] Gerar(BoletimDto boletim);
    }
}
