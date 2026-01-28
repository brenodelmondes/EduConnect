using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Turma.Dtos;

namespace EduConnect.API.Services.UseCases.Turma
{
    public interface ITurmaService
    {
        Task<TurmaListagemDto> CriarAsync(TurmaCriacaoDto dto);
        Task<TurmaListagemDto?> ObterPorIdAsync(int id);
        Task<IEnumerable<TurmaListagemDto>> ListarAsync();
        Task<TurmaListagemDto> AtualizarAsync(int id, TurmaAtualizacaoDto dto);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeDeTurmasAsync();
    }
}
