using System;
using EduConnect.API.Shared.Entities;

namespace EduConnect.API.Services.UseCases.Evento.Dtos
{
    public class EventoListagemDto
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public DateTime DataEvento { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public int UsuarioId { get; set; }
        public string UsuarioNome { get; set; } = string.Empty;
        public EventoScope Scope { get; set; }
        public int? TurmaId { get; set; }
        public string? TurmaSemestre { get; set; }
    }
}
