using AutoMapper;
using EduConnect.API.Services.UseCases.Turma.Dtos;
using TurmaEntity = EduConnect.API.Shared.Entities.Turma;

namespace EduConnect.API.Services.UseCases.Turma
{
    public class TurmaProfile : Profile
    {
        public TurmaProfile()
        {
            CreateMap<TurmaEntity, TurmaListagemDto>()
                .ForMember(dest => dest.MateriaNome, opt => opt.MapFrom(src => src.Materia != null ? src.Materia.Nome : string.Empty))
                .ForMember(dest => dest.CursoNome, opt => opt.MapFrom(src =>
                    src.Materia != null && src.Materia.Curso != null ? src.Materia.Curso.Nome : string.Empty))
                .ForMember(dest => dest.ProfessorNome, opt => opt.MapFrom(src =>
                    src.Professor != null && src.Professor.Usuario != null
                        ? src.Professor.Usuario.Nome
                        : (src.Professor != null && src.Professor.Titulacao != null ? src.Professor.Titulacao : string.Empty)));

            CreateMap<TurmaCriacaoDto, TurmaEntity>();
            CreateMap<TurmaAtualizacaoDto, TurmaEntity>();
        }
    }
}
