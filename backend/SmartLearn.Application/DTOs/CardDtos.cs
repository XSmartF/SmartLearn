namespace SmartLearn.Application.DTOs;

// ── Card ────────────────────────────────────────────────────────

public record CardDto(
    Guid Id,
    Guid LibraryId,
    string Front,
    string Back,
    string? Difficulty,
    string? Domain,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateCardRequest
{
    public Guid LibraryId { get; init; }
    public string Front { get; init; } = string.Empty;
    public string Back { get; init; } = string.Empty;
    public string? Domain { get; init; }
    public string? Difficulty { get; init; }
}

public record UpdateCardRequest
{
    public string? Front { get; init; }
    public string? Back { get; init; }
    public string? Domain { get; init; }
    public string? Difficulty { get; init; }
}

public record BulkCreateCardItem
{
    public string Front { get; init; } = string.Empty;
    public string Back { get; init; } = string.Empty;
    public string? Domain { get; init; }
}
