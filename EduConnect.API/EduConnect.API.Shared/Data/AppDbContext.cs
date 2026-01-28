using EduConnect.API.Shared.Data.SpResults;
using EduConnect.API.Shared.Entities;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Professor> Professores { get; set; }
    public DbSet<Perfil> Perfis { get; set; }

    public DbSet<Departamento> Departamentos { get; set; }
    public DbSet<Curso> Cursos { get; set; }
    public DbSet<Materia> Materias { get; set; }
    public DbSet<Turma> Turmas { get; set; }
    public DbSet<Aluno> Alunos { get; set; }
    public DbSet<Matricula> Matriculas { get; set; }
    public DbSet<Evento> Eventos { get; set; }

    public DbSet<BoletimLinhaSp> BoletimLinhasSp { get; set; }
    public DbSet<DashboardResumoSp> DashboardResumosSp { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Perfil>().HasData(
            new Perfil { Id = 1, Nome = "Administrador" },
            new Perfil { Id = 2, Nome = "Professor" },
            new Perfil { Id = 3, Nome = "Aluno" }
        );

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("Usuarios");
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Cpf).IsUnique();
        });

        modelBuilder.Entity<Aluno>(entity =>
        {
            entity.ToTable("Alunos");
            entity.HasIndex(e => e.Ra).IsUnique();

            entity.HasOne(e => e.Usuario)
                .WithMany()
                .HasForeignKey(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Curso)
                .WithMany(e => e.Alunos)
                .HasForeignKey(e => e.CursoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Professor>(entity =>
        {
            entity.ToTable("Professores");

            entity.HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<Departamento>()
                .WithMany()
                .HasForeignKey(e => e.DepartamentoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Curso>(entity =>
        {
            entity.ToTable("Cursos");

            entity.HasOne(e => e.Departamento)
                .WithMany()
                .HasForeignKey(e => e.DepartamentoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Materia>(entity =>
        {
            entity.ToTable("Materias");

            entity.HasOne(e => e.Curso)
                .WithMany(e => e.Materias)
                .HasForeignKey(e => e.CursoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Turma>(entity =>
        {
            entity.ToTable("Turmas");

            entity.HasOne(e => e.Materia)
                .WithMany()
                .HasForeignKey(e => e.MateriaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Professor)
                .WithMany()
                .HasForeignKey(e => e.ProfessorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Matricula>(entity =>
        {
            entity.ToTable("Matriculas");

            entity.HasIndex(e => new { e.AlunoId, e.TurmaId }).IsUnique();

            entity.HasOne(e => e.Aluno)
                .WithMany()
                .HasForeignKey(e => e.AlunoId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Turma)
                .WithMany()
                .HasForeignKey(e => e.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Evento>(entity =>
        {
            entity.ToTable("Eventos");

            entity.Property(e => e.Scope).HasConversion<string>();

            entity.HasOne(e => e.Usuario)
                .WithMany()
                .HasForeignKey(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Turma)
                .WithMany()
                .HasForeignKey(e => e.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<BoletimLinhaSp>().HasNoKey();
        modelBuilder.Entity<DashboardResumoSp>().HasNoKey();
    }
}