namespace SmartLearn.Application.DTOs;

// ── Progress ────────────────────────────────────────────────────

public record UserLibraryProgressDto(
    Guid Id,
    Guid UserId,
    Guid LibraryId,
    string? EngineState, // JSON
    DateTime UpdatedAt);

public record UpsertProgressRequest
{
    public string EngineState { get; init; } = "{}"; // JSON
}

public record ProgressStatsDto(
    int Mastered,
    int Learning,
    int Due,
    int Total);

public record ProgressSummaryDto(
    Guid UserId,
    Guid LibraryId,
    int Total,
    int Mastered,
    int Learning,
    int Due,
    double PercentMastered,
    DateTime UpdatedAt);
