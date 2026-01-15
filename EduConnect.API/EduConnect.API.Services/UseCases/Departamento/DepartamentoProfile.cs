using AutoMapper;
using EduConnect.API.Services.UseCases.Departamento.Dtos;
using DepartamentoEntity = EduConnect.API.Shared.Entities.Departamento;

namespace EduConnect.API.Services.UseCases.Departamento
{
    public class DepartamentoProfile : Profile
    {
        public DepartamentoProfile()
        {
            CreateMap<DepartamentoEntity, DepartamentoListagemDto>()
                .ForMember(dest => dest.QuantidadeDeCursos,
                    opt => opt.MapFrom(src => src.Cursos.Count));

            CreateMap<DepartamentoCriacaoDto, DepartamentoEntity>();
            CreateMap<DepartamentoAtualizacaoDto, DepartamentoEntity>();
        }
    }
}