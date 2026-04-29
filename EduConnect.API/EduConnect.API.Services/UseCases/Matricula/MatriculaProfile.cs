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
                .ForMember(dest => dest.AlunoNome, opt => opt.MapFrom(src =>
                    src.Aluno != null && src.Aluno.Usuario != null
                        ? (src.Aluno.Usuario.Nome + " " + src.Aluno.Usuario.Sobrenome)
                        : string.Empty))
                .ForMember(dest => dest.TurmaSemestre, opt => opt.MapFrom(src => src.Turma.Semestre))
                .ForMember(dest => dest.TurmaNome, opt => opt.MapFrom(src => src.Turma != null && src.Turma.Materia != null ? src.Turma.Materia.Nome : string.Empty))
                .ForMember(dest => dest.CursoNome, opt => opt.MapFrom(src => src.Aluno != null && src.Aluno.Curso != null ? src.Aluno.Curso.Nome : string.Empty));

            CreateMap<MatriculaCriacaoDto, MatriculaEntity>();
            CreateMap<MatriculaAtualizacaoDto, MatriculaEntity>();
        }
    }
}
