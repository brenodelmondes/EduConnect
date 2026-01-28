using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Services.UseCases.Materia.Dtos;

namespace EduConnect.API.Services.UseCases.Materia
{
    public interface IMateriaService
    {
        Task<MateriaListagemDto> CriarAsync(MateriaCriacaoDto dto);
        Task<MateriaListagemDto?> ObterPorIdAsync(int id);
        Task<IEnumerable<MateriaListagemDto>> ListarAsync();
        Task<MateriaListagemDto> AtualizarAsync(int id, MateriaAtualizacaoDto dto);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeDeMateriasAsync();
    }
}
