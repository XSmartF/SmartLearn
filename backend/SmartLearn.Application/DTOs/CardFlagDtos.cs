namespace SmartLearn.Application.DTOs;

// ── Card Flag ───────────────────────────────────────────────────

public record CardFlagDto(
    Guid Id,
    Guid UserId,
    Guid LibraryId,
    Guid CardId,
    bool Starred,
    string? Difficulty,
    DateTime UpdatedAt);

public record ToggleStarRequest
{
    public Guid CardId { get; init; }
    public Guid LibraryId { get; init; }
    public bool Starred { get; init; }
}

public record SetDifficultyRequest
{
    public Guid CardId { get; init; }
    public Guid LibraryId { get; init; }
    public string Difficulty { get; init; } = "medium"; // easy | medium | hard
}

// Map<cardId, { starred, difficulty }>
public record FlagMapEntryDto(
    bool? Starred,
    string? Difficulty);
