using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using EduConnect.API.Services.Exceptions;
using EduConnect.API.Services.UseCases.Aluno.Dtos;
using EduConnect.API.Shared.Repository;
using AlunoEntity = EduConnect.API.Shared.Entities.Aluno;

namespace EduConnect.API.Services.UseCases.Aluno
{
    public class AlunoService : IAlunoService
    {
        private readonly IAlunoRepository _alunoRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly ICursoRepository _cursoRepository;
        private readonly IMapper _mapper;

        public AlunoService(IAlunoRepository alunoRepository, IUsuarioRepository usuarioRepository, ICursoRepository cursoRepository, IMapper mapper)
        {
            _alunoRepository = alunoRepository;
            _usuarioRepository = usuarioRepository;
            _cursoRepository = cursoRepository;
            _mapper = mapper;
        }

        public async Task<AlunoListagemDto> CriarAsync(AlunoCriacaoDto dto)
        {
            var usuario = await _usuarioRepository.ObterPorIdAsync(dto.UsuarioId);
            if (usuario == null)
            {
                throw new ArgumentException("UsuarioId inválido.");
            }

            var curso = await _cursoRepository.ObterPorIdAsync(dto.CursoId);
            if (curso == null)
            {
                throw new ArgumentException("CursoId inválido.");
            }

            var entity = _mapper.Map<AlunoEntity>(dto);

            var created = await _alunoRepository.CriarAsync(entity);
            var loaded = await _alunoRepository.ObterPorIdComVinculosAsync(created.Id);

            return _mapper.Map<AlunoListagemDto>(loaded ?? created);
        }

        public async Task<AlunoListagemDto?> ObterPorIdAsync(int id)
        {
            var entity = await _alunoRepository.ObterPorIdComVinculosAsync(id);
            if (entity == null)
            {
                return null;
            }

            return _mapper.Map<AlunoListagemDto>(entity);
        }

        public async Task<IEnumerable<AlunoListagemDto>> ListarAsync()
        {
            var entities = await _alunoRepository.ObterTodosAsync();
            return entities.Select(_mapper.Map<AlunoListagemDto>);
        }

        public async Task<AlunoListagemDto> AtualizarAsync(int id, AlunoAtualizacaoDto dto)
        {
            var existente = await _alunoRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Aluno não encontrado.");
            }

            var usuario = await _usuarioRepository.ObterPorIdAsync(dto.UsuarioId);
            if (usuario == null)
            {
                throw new ArgumentException("UsuarioId inválido.");
            }

            var curso = await _cursoRepository.ObterPorIdAsync(dto.CursoId);
            if (curso == null)
            {
                throw new ArgumentException("CursoId inválido.");
            }

            _mapper.Map(dto, existente);

            await _alunoRepository.AtualizarAsync(existente);

            var loaded = await _alunoRepository.ObterPorIdComVinculosAsync(existente.Id);
            return _mapper.Map<AlunoListagemDto>(loaded ?? existente);
        }

        public async Task DeletarAsync(int id)
        {
            var existente = await _alunoRepository.ObterPorIdAsync(id);
            if (existente == null)
            {
                throw RegraDeNegocioException.NaoEncontrado("Aluno não encontrado.");
            }

            await _alunoRepository.DeletarAsync(id);
        }

        public Task<int> ObterQuantidadeDeAlunosAsync()
        {
            return _alunoRepository.ObterQuantidadeAsync();
        }
    }
}
