using AutoMapper;
using EduConnect.API.Services.UseCases.Matricula.Dtos;
using MatriculaEntity = EduConnect.API.Shared.Entities.Matricula;

namespace EduConnect.API.Services.UseCases.Matricula
{
    public class MatriculaProfile : Profile
    {
        public MatriculaProfile()
        {
            CreateMap<MatriculaEntity, MatriculaListagemDto>()
                .ForMember(dest => dest.AlunoRa, opt => opt.MapFrom(src => src.Aluno.Ra))
                .ForMember(dest => dest.TurmaSemestre, opt => opt.MapFrom(src => src.Turma.Semestre));

            CreateMap<MatriculaCriacaoDto, MatriculaEntity>();
            CreateMap<MatriculaAtualizacaoDto, MatriculaEntity>();
        }
    }
}
