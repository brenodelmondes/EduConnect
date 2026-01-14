using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduConnect.API.Shared.Entities
{
    public class Turma
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int MateriaId { get; set; }

        [Required]
        public int ProfessorId { get; set; }

        [Required]
        [StringLength(10)]
        public string Semestre { get; set; }

        [Required]
        [StringLength(50)]
        public string Local { get; set; }

        public Materia Materia { get; set; }
        public Professor Professor { get; set; }
    }
}