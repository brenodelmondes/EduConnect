using EduConnect.API.Shared.Entities.Professor;
using EduConnect.API.Shared.Repository;
using System.Collections.Generic;
using System.Threading.Tasks;
using ProfessorEntity = EduConnect.API.Shared.Entities.Professor.Professor;

namespace EduConnect.API.Services.UseCases.Professor
{
    public class ProfessorService : IProfessorService
    {
        private readonly ISuaRepository _suaRepository;

        public ProfessorService(ISuaRepository suaRepository)
        {
            _suaRepository = suaRepository;
        }

        public Task<ProfessorEntity> CriarAsync(ProfessorEntity professor)
        {
            return _suaRepository.CriarProfessorAsync(professor);
        }

        public Task<ProfessorEntity> ObterPorIdAsync(int id)
        {
            return _suaRepository.ProfessorPorIdAsync(id);
        }

        public Task<IEnumerable<ProfessorEntity>> ListarAsync()
        {
            return _suaRepository.ObterTodosProfessoresAsync();
        }

        public Task<ProfessorEntity> AtualizarAsync(int id, ProfessorEntity professor)
        {
            if (id != professor.Id)
            {
                throw new System.ArgumentException("O ID do professor na rota não corresponde ao ID no corpo da requisição.");
            }
            return _suaRepository.AtualizarProfessorAsync(professor);
        }

        public Task DeletarAsync(int id)
        {
            return _suaRepository.DeletarAsync(id);
        }

        public Task<int> ObterQuantidadeDeProfessoresAsync()
        {
            return _suaRepository.ObterQuantidadeProfessoresAsync();
        }
    }
}