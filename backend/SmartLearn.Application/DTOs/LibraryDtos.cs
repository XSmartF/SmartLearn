namespace SmartLearn.Application.DTOs;

// ── Library ─────────────────────────────────────────────────────

public record LibraryDto(
    Guid Id,
    Guid OwnerId,
    string Title,
    string? Description,
    string? Subject,
    string? DifficultyLabel,
    string[] Tags,
    string Visibility,
    int CardCount,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateLibraryRequest
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Subject { get; init; }
    public string? Difficulty { get; init; }
    public string[]? Tags { get; init; }
    public string? Visibility { get; init; } // "private" | "public"
}

public record UpdateLibraryRequest
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? Visibility { get; init; }
    public string[]? Tags { get; init; }
    public string? Subject { get; init; }
    public string? Difficulty { get; init; }
}
