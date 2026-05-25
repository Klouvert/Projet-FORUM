namespace ArbreIntelligence.Entities;

public class IdeaVote
{
    public Guid Id { get; set; }
    public Guid IdeaId { get; set; }
    public Guid UserId { get; set; }
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Idea Idea { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}