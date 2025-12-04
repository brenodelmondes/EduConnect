using EduConnect.API.Shared.Entities;
using EduConnect.API.Shared.Entities.Professor;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Shared.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Professor> Professores { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configurações do modelo para Professor, se houver
            // modelBuilder.Entity<Professor>().ToTable("Professores");

            // Configurações do modelo para Usuario
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("Usuarios");
                // entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Cpf).IsUnique();
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}