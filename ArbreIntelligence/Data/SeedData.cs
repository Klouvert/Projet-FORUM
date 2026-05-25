using ArbreIntelligence.Data;
using ArbreIntelligence.Entities;
using Microsoft.AspNetCore.Identity;

namespace ArbreIntelligence.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        if (db.TrunkValues.Any()) return; // déjà seedé

        // Valeurs du tronc
        var values = new[]
        {
            new TrunkValue { Id = Guid.NewGuid(), Name = "Justice", Description = "Équité et impartialité dans les décisions collectives." },
            new TrunkValue { Id = Guid.NewGuid(), Name = "Liberté", Description = "Respect de l'autonomie individuelle et collective." },
            new TrunkValue { Id = Guid.NewGuid(), Name = "Solidarité", Description = "Soutien mutuel entre les membres de la communauté." },
        };
        db.TrunkValues.AddRange(values);

        // Utilisateur de demo
        var demo = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "Ben",
            Email = "benoit.kreins@live.com",
            DisplayName = "Benoit Kreins",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };
        await userManager.CreateAsync(demo, "demo123");

        // Branche
        var branch = new Branch
        {
            Id = Guid.NewGuid(),
            Name = "Éducation",
            Description = "Idées concernant le système éducatif",
            CreatedByUserId = demo.Id,
            CreatedAt = DateTime.UtcNow
        };
        db.Branches.Add(branch);

        // Idées
        db.Ideas.AddRange(
            new Idea
            {
                Id = Guid.NewGuid(), Title = "Réforme des programmes scolaires",
                Content = "Intégrer la pensée critique dès le primaire.",
                AuthorId = demo.Id, BranchId = branch.Id,
                Level = IdeaLevel.Fruit, Status = IdeaStatus.Active, Domain = IdeaDomain.Social,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            },
            new Idea
            {
                Id = Guid.NewGuid(), Title = "Revenu universel de base",
                Content = "Garantir un minimum vital à chaque citoyen.",
                AuthorId = demo.Id, BranchId = null,
                Level = IdeaLevel.Bud, Status = IdeaStatus.Active, Domain = IdeaDomain.Economy,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            }
        );

        await db.SaveChangesAsync();
    }
}
