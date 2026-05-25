namespace ArbreIntelligence.Entities;

public enum ArgumentSide { For = 0, Against = 1 }

public class Argument
{
    public Guid Id { get; set; }
    public Guid IdeaId { get; set; }
    public Guid AuthorId { get; set; }
    public ArgumentSide Side { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Idea Idea { get; set; } = null!;
    public ApplicationUser Author { get; set; } = null!;
    public ICollection<ArgumentVote> Votes { get; set; } = [];
}