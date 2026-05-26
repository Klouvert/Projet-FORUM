namespace ArbreIntelligence.DTOs.Admin;

public record UserSummaryDto(
    string Id,
    string DisplayName,
    string Email,
    bool IsAdmin
);
