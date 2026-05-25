namespace ArbreIntelligence.Entities;

public class Amendment
{
    public Guid Id { get; set; }
    public Guid ParentIdeaId { get; set; }
    public Guid AuthorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsMerged { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? MergedAt { get; set; }
    public Guid? MergedByUserId { get; set; }
    public Idea ParentIdea { get; set; } = null!;
    public ApplicationUser Author { get; set; } = null!;
    public ICollection<AmendmentVote> Votes { get; set; } = [];
}