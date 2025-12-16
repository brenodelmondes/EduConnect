using Microsoft.EntityFrameworkCore;
using EduConnect.API.Shared.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Professor> Professores { get; set; }
    public DbSet<Perfil> Perfis { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Perfil>().HasData(
            new Perfil { Id = 1, Nome = "Administrador" },
            new Perfil { Id = 2, Nome = "Professor" },
            new Perfil { Id = 3, Nome = "Aluno" }
        );

        modelBuilder.Entity<Usuario>().HasData(
            new Usuario
            {
                Id = 1,
                Nome = "Super Admin",
                Sobrenome = "Sistema",
                Email = "admin@educonnect.com",
                Cpf = "12345678910",
                Senha = "senha_hash_super_segura",
                PerfilId = 1
            }
        );
    }
}