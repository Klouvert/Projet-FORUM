namespace ArbreIntelligence.Entities;

public class ArgumentVote
{
    public Guid Id { get; set; }
    public Guid ArgumentId { get; set; }
    public Guid UserId { get; set; }
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Argument Argument { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}