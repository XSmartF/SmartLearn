namespace SmartLearn.Application.DTOs;

// ── Notification ────────────────────────────────────────────────

public record NotificationDto(
    Guid Id,
    Guid UserId,
    string Type,
    string Title,
    string Message,
    bool Read,
    string? Data,
    DateTime CreatedAt);

public record CreateNotificationRequest
{
    public Guid UserId { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? Data { get; init; } // JSON
}
