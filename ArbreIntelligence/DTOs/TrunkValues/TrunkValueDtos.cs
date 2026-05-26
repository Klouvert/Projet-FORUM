namespace ArbreIntelligence.DTOs.TrunkValues;

public record CreateTrunkValueRequest(string Name, string Description);

public record TrunkValueDto(Guid Id, string Name, string Description);
