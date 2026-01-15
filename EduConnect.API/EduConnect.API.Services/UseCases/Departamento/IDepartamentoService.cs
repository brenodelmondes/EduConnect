using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Departamento.Dtos;

namespace EduConnect.API.Services.UseCases.Departamento
{
    public interface IDepartamentoService
    {
        Task<DepartamentoListagemDto> CriarAsync(DepartamentoCriacaoDto dto);
        Task<DepartamentoListagemDto?> ObterPorIdAsync(int id);
        Task<IEnumerable<DepartamentoListagemDto>> ListarAsync();
        Task<DepartamentoListagemDto> AtualizarAsync(int id, DepartamentoAtualizacaoDto dto);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeDeDepartamentosAsync();
    }
}