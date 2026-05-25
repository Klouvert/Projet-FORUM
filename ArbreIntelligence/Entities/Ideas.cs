namespace ArbreIntelligence.Entities;

public enum IdeaLevel { Seed = 0, Sprout = 1, Branch = 2, Canopy = 3 }
public enum IdeaStatus { Draft = 0, Active = 1, Archived = 2 }

public class Idea
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }
    public Guid? BranchId { get; set; }
    public IdeaLevel Level { get; set; }
    public IdeaStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public ApplicationUser Author { get; set; } = null!;
    public Branch? Branch { get; set; }
    public ICollection<IdeaVote> Votes { get; set; } = [];
    public ICollection<Argument> Arguments { get; set; } = [];
    public ICollection<Amendment> Amendments { get; set; } = [];
}