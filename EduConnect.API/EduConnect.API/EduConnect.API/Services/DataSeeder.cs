using EduConnect.API.Shared.Entities;
using EduConnect.API.Shared.Repository;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.API.Services;

public static class DataSeeder
{
    public static async Task SeedAdminAsync(IServiceProvider services, IConfiguration configuration)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Garante Perfis (caso banco não tenha recebido HasData por migrations)
        if (!await db.Perfis.AnyAsync())
        {
            db.Perfis.AddRange(
                new Perfil { Id = 1, Nome = "Administrador" },
                new Perfil { Id = 2, Nome = "Professor" },
                new Perfil { Id = 3, Nome = "Aluno" }
            );
            await db.SaveChangesAsync();
        }

        var adminEmail = configuration["Seed:DefaultEmail"] ?? "admin@educonnect.com";
        var adminPassword = configuration["Seed:DefaultPassword"] ?? "123456";
        var adminName = configuration["Seed:DefaultName"] ?? "Admin";

        var existing = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (existing != null)
        {
            // Se a senha atual não parece bcrypt, corrige na inicialização
            if (string.IsNullOrWhiteSpace(existing.Senha) || !existing.Senha.StartsWith("$2"))
            {
                existing.Senha = BCrypt.Net.BCrypt.HashPassword(adminPassword);
                await db.SaveChangesAsync();
            }
            return;
        }

        db.Usuarios.Add(new Usuario
        {
            Nome = adminName,
            Sobrenome = "Sistema",
            Email = adminEmail,
            Cpf = "12345678910",
            PerfilId = 1,
            Senha = BCrypt.Net.BCrypt.HashPassword(adminPassword)
        });

        await db.SaveChangesAsync();
    }
}
