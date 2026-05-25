namespace ArbreIntelligence.Entities;

public class AmendmentVote
{
    public Guid Id { get; set; }
    public Guid AmendmentId { get; set; }
    public Guid UserId { get; set; }
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Amendment Amendment { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}