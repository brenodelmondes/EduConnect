using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Curso.Dtos;

namespace EduConnect.API.Services.UseCases.Curso
{
    public interface ICursoService
    {
        Task<CursoListagemDto> CriarAsync(CursoCriacaoDto dto);
        Task<CursoListagemDto?> ObterPorIdAsync(int id);
        Task<IEnumerable<CursoListagemDto>> ListarAsync();
        Task<CursoListagemDto> AtualizarAsync(int id, CursoAtualizacaoDto dto);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeDeCursosAsync();
    }
}