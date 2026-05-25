using Microsoft.AspNetCore.Identity;

namespace ArbreIntelligence.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Branch> Branches { get; set; } = [];
    public ICollection<Idea> Ideas { get; set; } = [];
}