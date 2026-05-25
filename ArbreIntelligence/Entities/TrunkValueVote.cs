namespace ArbreIntelligence.Entities;

public class TrunkValueVote
{
    public Guid Id { get; set; }
    public Guid TrunkValueId { get; set; }
    public Guid UserId { get; set; }
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public TrunkValue TrunkValue { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}