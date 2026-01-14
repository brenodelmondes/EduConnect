using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduConnect.API.Shared.Repository;
using ProfessorEntity = EduConnect.API.Shared.Entities.Professor;

namespace EduConnect.API.Services.UseCases.Professor
{
    public class ProfessorService : IProfessorService
    {
        private readonly IProfessorRepository _professorRepository;

        public ProfessorService(IProfessorRepository professorRepository)
        {
            _professorRepository = professorRepository;
        }

        public Task<ProfessorEntity> CriarAsync(ProfessorEntity professor)
        {
            return _professorRepository.CriarAsync(professor);
        }

        public async Task<ProfessorEntity?> ObterPorIdAsync(int id)
        {
            return await _professorRepository.ObterPorIdAsync(id);
        }

        public Task<IEnumerable<ProfessorEntity>> ListarAsync()
        {
            return _professorRepository.ObterTodosAsync();
        }

        public Task<ProfessorEntity> AtualizarAsync(int id, ProfessorEntity professor)
        {
            if (id != professor.Id)
            {
                throw new ArgumentException("O ID do professor na rota não corresponde ao ID no corpo da requisição.");
            }

            return _professorRepository.AtualizarAsync(professor);
        }

        public Task DeletarAsync(int id)
        {
            return _professorRepository.DeletarAsync(id);
        }

        public Task<int> ObterQuantidadeDeProfessoresAsync()
        {
            return _professorRepository.ObterQuantidadeAsync();
        }
    }
}