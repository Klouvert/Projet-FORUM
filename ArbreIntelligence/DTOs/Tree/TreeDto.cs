namespace ArbreIntelligence.DTOs.Tree;

public record TrunkValueDto(Guid Id, string Name, string Description, double AverageScore, int VoteCount);
public record BranchDto(Guid Id, string Name, string? Description, int IdeaCount, DateTime CreatedAt);
public record IdeaNodeDto(Guid Id, string Title, string Content, int Level, string Status,
    double AverageScore, int VoteCount, DateTime CreatedAt, string AuthorName);

public record TreeDto(
    IEnumerable<TrunkValueDto> TrunkValues,
    IEnumerable<BranchDto> Branches,
    IEnumerable<IdeaNodeDto> Ideas
);