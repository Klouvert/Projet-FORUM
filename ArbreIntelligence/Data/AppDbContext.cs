using ArbreIntelligence.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ArbreIntelligence.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Idea> Ideas => Set<Idea>();
    public DbSet<TrunkValue> TrunkValues => Set<TrunkValue>();
    public DbSet<TrunkValueVote> TrunkValueVotes => Set<TrunkValueVote>();
    public DbSet<IdeaVote> IdeaVotes => Set<IdeaVote>();
    public DbSet<Argument> Arguments => Set<Argument>();
    public DbSet<ArgumentVote> ArgumentVotes => Set<ArgumentVote>();
    public DbSet<Amendment> Amendments => Set<Amendment>();
    public DbSet<AmendmentVote> AmendmentVotes => Set<AmendmentVote>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<IdeaVote>()
            .HasIndex(v => new { v.UserId, v.IdeaId }).IsUnique();
        builder.Entity<IdeaVote>()
            .ToTable(t => t.HasCheckConstraint("CK_IdeaVotes_Score", "\"Score\" >= 1 AND \"Score\" <= 10"));

        builder.Entity<TrunkValueVote>()
            .HasIndex(v => new { v.UserId, v.TrunkValueId }).IsUnique();
        builder.Entity<TrunkValueVote>()
            .ToTable(t => t.HasCheckConstraint("CK_TrunkValueVotes_Score", "\"Score\" >= 1 AND \"Score\" <= 10"));

        builder.Entity<AmendmentVote>()
            .HasIndex(v => new { v.UserId, v.AmendmentId }).IsUnique();
        builder.Entity<AmendmentVote>()
            .ToTable(t => t.HasCheckConstraint("CK_AmendmentVotes_Score", "\"Score\" >= 1 AND \"Score\" <= 10"));

        builder.Entity<ArgumentVote>()
            .HasIndex(v => new { v.UserId, v.ArgumentId }).IsUnique();
        builder.Entity<ArgumentVote>()
            .ToTable(t => t.HasCheckConstraint("CK_ArgumentVotes_Score", "\"Score\" >= 1 AND \"Score\" <= 10"));

        builder.Entity<Branch>()
            .HasOne(b => b.CreatedBy)
            .WithMany(u => u.Branches)
            .HasForeignKey(b => b.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Branch>()
            .HasOne(b => b.ParentBranch)
            .WithMany(b => b.ChildBranches)
            .HasForeignKey(b => b.ParentBranchId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Idea>()
            .HasOne(i => i.Author)
            .WithMany(u => u.Ideas)
            .HasForeignKey(i => i.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Idea>()
            .HasOne(i => i.Branch)
            .WithMany(b => b.Ideas)
            .HasForeignKey(i => i.BranchId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}