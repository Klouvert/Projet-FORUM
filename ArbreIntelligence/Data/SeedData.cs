using ArbreIntelligence.Data;
using ArbreIntelligence.Entities;
using Microsoft.AspNetCore.Identity;

namespace ArbreIntelligence.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        var db          = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        if (db.TrunkValues.Any()) return; // déjà seedé

        /* ── Valeurs du tronc ─────────────────────────────────── */
        db.TrunkValues.AddRange(
            new TrunkValue { Id = Guid.NewGuid(), Name = "Justice",    Description = "Équité et impartialité dans les décisions collectives." },
            new TrunkValue { Id = Guid.NewGuid(), Name = "Liberté",    Description = "Respect de l'autonomie individuelle et collective." },
            new TrunkValue { Id = Guid.NewGuid(), Name = "Solidarité", Description = "Soutien mutuel entre les membres de la communauté." }
        );

        /* ── Utilisateur de démo ──────────────────────────────── */
        var demo = new ApplicationUser
        {
            Id             = Guid.NewGuid(),
            UserName       = "Ben",
            Email          = "benoit.kreins@live.com",
            DisplayName    = "Benoit Kreins",
            EmailConfirmed = true,
            CreatedAt      = DateTime.UtcNow
        };
        await userManager.CreateAsync(demo, "demo123");

        /* ── Branche 1 : Éducation ────────────────────────────── */
        var branchEdu = new Branch
        {
            Id               = Guid.NewGuid(),
            Name             = "Éducation",
            Description      = "Idées concernant le système éducatif",
            CreatedByUserId  = demo.Id,
            CreatedAt        = DateTime.UtcNow
        };
        db.Branches.Add(branchEdu);

        /* ── Branche 2 : Économie ─────────────────────────────── */
        var branchEco = new Branch
        {
            Id               = Guid.NewGuid(),
            Name             = "Économie",
            Description      = "Idées concernant l'économie et le travail",
            CreatedByUserId  = demo.Id,
            CreatedAt        = DateTime.UtcNow
        };
        db.Branches.Add(branchEco);

        /* ── Branche 3 : Démocratie ───────────────────────────── */
        var branchDemo = new Branch
        {
            Id               = Guid.NewGuid(),
            Name             = "Démocratie",
            Description      = "Idées concernant la participation citoyenne",
            CreatedByUserId  = demo.Id,
            CreatedAt        = DateTime.UtcNow
        };
        db.Branches.Add(branchDemo);

        /* ── Idées ────────────────────────────────────────────── */
        db.Ideas.AddRange(
            // Branche Éducation
            new Idea
            {
                Id        = Guid.NewGuid(),
                Title     = "Réforme des programmes scolaires",
                Content   = "Intégrer la pensée critique dès le primaire.",
                AuthorId  = demo.Id, BranchId = branchEdu.Id,
                Level     = IdeaLevel.Fruit, Status = IdeaStatus.Active, Domain = IdeaDomain.Social,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            },

            // Branche Économie
            new Idea
            {
                Id        = Guid.NewGuid(),
                Title     = "Revenu universel de base",
                Content   = "Garantir un minimum vital à chaque citoyen.",
                AuthorId  = demo.Id, BranchId = branchEco.Id,
                Level     = IdeaLevel.Bud, Status = IdeaStatus.Active, Domain = IdeaDomain.Economy,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            },

            // Branche Démocratie — 4 étapes
            new Idea
            {
                Id        = Guid.NewGuid(),
                Title     = "Assemblées citoyennes",
                Content   = "Constituer des assemblées tirées au sort pour délibérer sur les lois.",
                AuthorId  = demo.Id, BranchId = branchDemo.Id,
                Level     = IdeaLevel.Bud, Status = IdeaStatus.Active, Domain = IdeaDomain.Social,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            },
            new Idea
            {
                Id        = Guid.NewGuid(),
                Title     = "Budget participatif",
                Content   = "Permettre aux citoyens de voter sur l'allocation d'une partie du budget public.",
                AuthorId  = demo.Id, BranchId = branchDemo.Id,
                Level     = IdeaLevel.Flower, Status = IdeaStatus.Active, Domain = IdeaDomain.Economy,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            },
            new Idea
            {
                Id        = Guid.NewGuid(),
                Title     = "Référendum d'initiative citoyenne",
                Content   = "Permettre aux citoyens de proposer et voter des référendums.",
                AuthorId  = demo.Id, BranchId = branchDemo.Id,
                Level     = IdeaLevel.Fruit, Status = IdeaStatus.Active, Domain = IdeaDomain.Ecology,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            },
            new Idea
            {
                Id        = Guid.NewGuid(),
                Title     = "Charte constitutionnelle",
                Content   = "Inscrire les droits numériques et environnementaux dans la constitution.",
                AuthorId  = demo.Id, BranchId = branchDemo.Id,
                Level     = IdeaLevel.Leaf, Status = IdeaStatus.Active, Domain = IdeaDomain.Culture,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            }
        );

        await db.SaveChangesAsync();
    }
}
