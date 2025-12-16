using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduConnect.API.Shared.Entities
{
    public class Professor
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }  // necessário 'set' para EF persistir e materializar
        [Required]
        public int UsuarioId { get; set; }
        [Required]
        public int DepartamentoId { get; set; }
        [Required]
        [StringLength(100)]
        public string Titulacao { get; set; }
    }
}
