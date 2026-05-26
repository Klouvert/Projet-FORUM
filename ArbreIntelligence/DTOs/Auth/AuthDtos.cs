namespace ArbreIntelligence.DTOs.Auth;

public record RegisterRequest(
    string UserName,
    string Email,
    string Password,
    string DisplayName
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    string Token,
    string UserId,
    string DisplayName,
    string Email,
    DateTime ExpiresAt,
    bool IsAdmin
);
