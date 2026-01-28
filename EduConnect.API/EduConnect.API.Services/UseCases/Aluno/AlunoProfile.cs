using AutoMapper;
using EduConnect.API.Services.UseCases.Aluno.Dtos;
using AlunoEntity = EduConnect.API.Shared.Entities.Aluno;

namespace EduConnect.API.Services.UseCases.Aluno
{
    public class AlunoProfile : Profile
    {
        public AlunoProfile()
        {
            CreateMap<AlunoEntity, AlunoListagemDto>()
                .ForMember(dest => dest.UsuarioNome, opt => opt.MapFrom(src => src.Usuario.Nome))
                .ForMember(dest => dest.UsuarioEmail, opt => opt.MapFrom(src => src.Usuario.Email))
                .ForMember(dest => dest.CursoNome, opt => opt.MapFrom(src => src.Curso.Nome));

            CreateMap<AlunoCriacaoDto, AlunoEntity>();
            CreateMap<AlunoAtualizacaoDto, AlunoEntity>();
        }
    }
}
