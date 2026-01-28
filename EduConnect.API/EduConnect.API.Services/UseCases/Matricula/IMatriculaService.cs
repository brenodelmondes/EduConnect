using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Matricula.Dtos;

namespace EduConnect.API.Services.UseCases.Matricula
{
    public interface IMatriculaService
    {
        Task<MatriculaListagemDto> CriarAsync(MatriculaCriacaoDto dto);
        Task<MatriculaListagemDto?> ObterPorIdAsync(int id);
        Task<IEnumerable<MatriculaListagemDto>> ListarAsync();
        Task<MatriculaListagemDto> AtualizarAsync(int id, MatriculaAtualizacaoDto dto);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeDeMatriculasAsync();
    }
}
