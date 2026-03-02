namespace SmartLearn.Application.DTOs;

// ── Note ────────────────────────────────────────────────────────

public record NoteDto(
    Guid Id,
    Guid OwnerId,
    string Title,
    string? Content,
    string[] Tags,
    string Visibility,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateNoteRequest
{
    public string Title { get; init; } = string.Empty;
    public string? Content { get; init; }
    public string[]? Tags { get; init; }
    public string? Visibility { get; init; }
}

public record UpdateNoteRequest
{
    public string? Title { get; init; }
    public string? Content { get; init; }
    public string[]? Tags { get; init; }
    public string? Visibility { get; init; }
}
