using EduConnect.API.Shared.Entities;
using EduConnect.API.Shared.Entities.Professor;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Professor> Professores { get; set; }

}