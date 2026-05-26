namespace ArbreIntelligence.Entities;

public class Branch
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? ParentBranchId { get; set; }
    public ApplicationUser CreatedBy { get; set; } = null!;
    public Branch? ParentBranch { get; set; }
    public ICollection<Branch> ChildBranches { get; set; } = [];
    public ICollection<Idea> Ideas { get; set; } = [];
}