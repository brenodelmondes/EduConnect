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
                .ForMember(dest => dest.MateriaNome, opt => opt.MapFrom(src => src.Materia.Nome))
                .ForMember(dest => dest.ProfessorNome, opt => opt.MapFrom(src => src.Professor.Titulacao));

            CreateMap<TurmaCriacaoDto, TurmaEntity>();
            CreateMap<TurmaAtualizacaoDto, TurmaEntity>();
        }
    }
}
