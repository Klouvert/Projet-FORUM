namespace ArbreIntelligence.Entities;

public class TrunkValue
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<TrunkValueVote> Votes { get; set; } = [];
}