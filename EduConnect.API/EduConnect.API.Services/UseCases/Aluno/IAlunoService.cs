using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Aluno.Dtos;

namespace EduConnect.API.Services.UseCases.Aluno
{
    public interface IAlunoService
    {
        Task<AlunoListagemDto> CriarAsync(AlunoCriacaoDto dto);
        Task<AlunoListagemDto?> ObterPorIdAsync(int id);
        Task<IEnumerable<AlunoListagemDto>> ListarAsync();
        Task<AlunoListagemDto> AtualizarAsync(int id, AlunoAtualizacaoDto dto);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeDeAlunosAsync();
    }
}
