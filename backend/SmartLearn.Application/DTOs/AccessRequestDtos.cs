namespace SmartLearn.Application.DTOs;

// ── Access Request ──────────────────────────────────────────────

public record AccessRequestDto(
    Guid Id,
    Guid LibraryId,
    Guid RequesterId,
    Guid OwnerId,
    string Status,
    DateTime CreatedAt);

public record CreateAccessRequestInput
{
    public Guid LibraryId { get; init; }
    public Guid OwnerId { get; init; }
}

public record ActOnAccessRequestInput
{
    public bool Approve { get; init; }
}
