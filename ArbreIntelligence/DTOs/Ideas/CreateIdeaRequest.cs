namespace ArbreIntelligence.DTOs.Ideas;

public record CreateIdeaRequest(
    string Title,
    string Content,
    string Domain,
    Guid? BranchId
);
