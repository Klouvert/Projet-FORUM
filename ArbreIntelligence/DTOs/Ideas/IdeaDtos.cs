namespace ArbreIntelligence.DTOs.Ideas;

public record ArgumentDto(
    Guid Id,
    string Content,
    string Side,           // "pour" | "contre"
    double AverageScore,
    int VoteCount,
    DateTime CreatedAt,
    string AuthorName
);

public record AmendmentDto(
    Guid Id,
    string Title,
    string Content,
    bool IsMerged,
    double AverageScore,
    int VoteCount,
    DateTime CreatedAt,
    string AuthorName
);

public record IdeaSummaryDto(
    Guid Id,
    string Title,
    string Content,
    int Level,
    string Status,
    string Domain,
    double AverageScore,
    int VoteCount,
    DateTime CreatedAt,
    string AuthorName,
    Guid? BranchId
);

public record IdeaDetailDto(
    Guid Id,
    string Title,
    string Content,
    int Level,
    string Status,
    string Domain,
    double AverageScore,
    int VoteCount,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string AuthorName,
    Guid AuthorId,
    Guid? BranchId,
    IEnumerable<ArgumentDto> Arguments,
    IEnumerable<AmendmentDto> Amendments
);

public record VoteRequest(int Score);
