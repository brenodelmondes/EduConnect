using AutoMapper;
using EduConnect.API.Services.UseCases.Curso.Dtos;
using CursoEntity = EduConnect.API.Shared.Entities.Curso;

namespace EduConnect.API.Services.UseCases.Curso
{
    public class CursoProfile : Profile
    {
        public CursoProfile()
        {
            CreateMap<CursoCriacaoDto, CursoEntity>();
            CreateMap<CursoAtualizacaoDto, CursoEntity>();

            CreateMap<CursoEntity, CursoListagemDto>()
                .ForMember(dest => dest.DepartamentoNome,
                    opt => opt.MapFrom(src => src.Departamento.Nome))
                .ForMember(dest => dest.QuantidadeDeMaterias,
                    opt => opt.MapFrom(src => src.Materias.Count))
                .ForMember(dest => dest.QuantidadeDeAlunos,
                    opt => opt.MapFrom(src => src.Alunos.Count));
        }
    }
}