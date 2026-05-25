using ArbreIntelligence.Data;
using ArbreIntelligence.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var dbProvider = builder.Configuration["Database:Provider"] ?? "sqlite";
var connectionString = builder.Configuration["Database:ConnectionString"]!;

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (dbProvider == "postgres")
        options.UseNpgsql(connectionString);
    else
        options.UseSqlite(connectionString);
});

// CORS depuis config
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// CORS — autorise le frontend Vite (port 5173)
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

// Migrations + Seed auto au démarrage
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // En dev SQLite : recrée proprement si nécessaire
    if (dbProvider == "sqlite")
        db.Database.EnsureCreated();
    else
        db.Database.Migrate(); // Postgres : migrations versionnées
    
    await SeedData.InitializeAsync(scope.ServiceProvider);

}

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();