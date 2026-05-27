namespace ArbreIntelligence.DTOs.Tree;

public record TrunkValueDto(Guid Id, string Name, string Description, double AverageScore, int VoteCount);
public record BranchDto(Guid Id, string Name, string? Description, int IdeaCount, DateTime CreatedAt, Guid? ParentBranchId);
public record IdeaNodeDto(Guid Id, string Title, string Content, int Level, string Status,
    string Domain, double AverageScore, int VoteCount, DateTime CreatedAt, string AuthorName, Guid? BranchId);

public record TreeDto(
    IEnumerable<TrunkValueDto> TrunkValues,
    IEnumerable<BranchDto> Branches,
    IEnumerable<IdeaNodeDto> Ideas
);
