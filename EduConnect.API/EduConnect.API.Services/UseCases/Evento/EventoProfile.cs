using AutoMapper;
using EduConnect.API.Services.UseCases.Evento.Dtos;
using EventoEntity = EduConnect.API.Shared.Entities.Evento;

namespace EduConnect.API.Services.UseCases.Evento
{
    public class EventoProfile : Profile
    {
        public EventoProfile()
        {
            CreateMap<EventoEntity, EventoListagemDto>()
                .ForMember(dest => dest.UsuarioNome, opt => opt.MapFrom(src => src.Usuario.Nome))
                .ForMember(dest => dest.TurmaSemestre, opt => opt.MapFrom(src => src.Turma != null ? src.Turma.Semestre : null));

            CreateMap<EventoCriacaoDto, EventoEntity>();
            CreateMap<EventoAtualizacaoDto, EventoEntity>();
        }
    }
}
