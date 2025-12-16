using EduConnect.API.Services.UseCases.Professor;
using EduConnect.API.Services.UseCases.Usuario;
using EduConnect.API.Shared.Data;
using EduConnect.API.Shared.Repository;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Adicionar a configuração do DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

// 2. Registrar Repositório e Serviços
builder.Services.AddScoped<ISuaRepository, SuaRepository>();
builder.Services.AddScoped<IProfessorService, ProfessorService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Bloco de código para criar o banco de dados na inicialização.
// Isso substitui o Migrate() e contorna as ferramentas de linha de comando quebradas.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        logger.LogInformation("Tentando criar o banco de dados com EnsureCreated()...");
        
        // EnsureCreated retorna 'true' se o banco foi criado, 'false' se já existia.
        var created = dbContext.Database.EnsureCreated();
        
        if (created)
        {
            logger.LogInformation("Banco de dados e tabelas foram criados com sucesso.");
        }
        else
        {
            logger.LogInformation("O banco de dados já existia. Nenhuma ação foi tomada.");
        }
    }
    catch (Exception ex)
    {
        // Loga qualquer erro que ocorra durante a tentativa de criar o banco.
        logger.LogError(ex, "Ocorreu um erro crítico ao inicializar o banco de dados.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();