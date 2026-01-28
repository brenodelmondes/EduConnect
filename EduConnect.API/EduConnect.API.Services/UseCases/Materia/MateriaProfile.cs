using AutoMapper;
using EduConnect.API.Services.UseCases.Materia.Dtos;
using MateriaEntity = EduConnect.API.Shared.Entities.Materia;

namespace EduConnect.API.Services.UseCases.Materia
{
    public class MateriaProfile : Profile
    {
        public MateriaProfile()
        {
            CreateMap<MateriaEntity, MateriaListagemDto>()
                .ForMember(dest => dest.CursoNome, opt => opt.MapFrom(src => src.Curso.Nome));

            CreateMap<MateriaCriacaoDto, MateriaEntity>();
            CreateMap<MateriaAtualizacaoDto, MateriaEntity>();
        }
    }
}
