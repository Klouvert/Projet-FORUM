namespace ArbreIntelligence.DTOs.Branches;

public record CreateBranchRequest(string Name, string? Description, Guid? ParentBranchId = null);
