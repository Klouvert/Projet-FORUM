namespace ArbreIntelligence.DTOs.Ideas;

public record CreateArgumentRequest(
    string Content,
    string Side  // "pour" | "contre"
);
