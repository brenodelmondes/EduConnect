using EduConnect.API.Shared.Entities.Professor;

namespace EduConnect.API.Shared.Repository;

public interface ISuaRepository
{
    Task<Professor> CriarProfessorAsync(Professor professor);
    Task<Professor> ProfessorPorIdAsync(int id);
    Task<IEnumerable<Professor>> ObterTodosProfessoresAsync();
    Task<Professor> AtualizarProfessorAsync(Professor professor);
    Task DeletarAsync(int id);
    Task<int> ObterQuantidadeProfessoresAsync();
    Task<int> ObterQuantidadeDeUsuarioAsync();
}
