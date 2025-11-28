using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProfessorEntity = EduConnect.API.Shared.Entities.Professor.Professor;

namespace EduConnect.API.Services.UseCases.Professor
{
    public interface IProfessorService
    {
        Task<ProfessorEntity> CriarAsync(ProfessorEntity professor);
        Task<ProfessorEntity> ObterPorIdAsync(int id);
        Task<IEnumerable<ProfessorEntity>> ListarAsync();
        Task<ProfessorEntity> AtualizarAsync(int id, ProfessorEntity professor);
        Task DeletarAsync(int id);
        Task<int> ObterQuantidadeDeProfessoresAsync();
    }
}
