namespace SmartLearn.Application.DTOs;

// ── Study Event ─────────────────────────────────────────────────

public record StudyEventDto(
    Guid Id,
    Guid UserId,
    string Title,
    string Description,
    DateTime StartTime,
    DateTime EndTime,
    string Type,
    string Status,
    string? FlashcardSet,
    int CardCount,
    Guid? CardId,
    Guid? LibraryId,
    bool AutoScheduled,
    string? LastChoice,
    DateTime? CompletedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateStudyEventRequest
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public string Type { get; init; } = "study"; // review|study|deadline|challenge|favorite_review|create
    public string? FlashcardSet { get; init; }
    public int CardCount { get; init; }
    public Guid? CardId { get; init; }
    public Guid? LibraryId { get; init; }
}

public record UpdateStudyEventRequest
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public DateTime? StartTime { get; init; }
    public DateTime? EndTime { get; init; }
    public string? Type { get; init; }
    public string? FlashcardSet { get; init; }
    public int? CardCount { get; init; }
    public Guid? CardId { get; init; }
    public Guid? LibraryId { get; init; }
}
