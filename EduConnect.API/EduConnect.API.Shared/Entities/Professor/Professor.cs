using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduConnect.API.Shared.Entities.Professor
{
    public class Professor
    {
        public int Id { get; }
        public int UsuarioId { get; set; }
        public int DepartamentoId { get; set; }
        public string Titulacao { get; set; }
    }
}
