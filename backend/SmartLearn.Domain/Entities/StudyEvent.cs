using SmartLearn.Domain.Common;
using SmartLearn.Domain.Enums;

namespace SmartLearn.Domain.Entities;

public class StudyEvent : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public StudyEventType Type { get; set; }
    public StudyEventStatus Status { get; set; } = StudyEventStatus.Upcoming;
    public string? FlashcardSet { get; set; }
    public int CardCount { get; set; }
    public Guid? CardId { get; set; }
    public Guid? LibraryId { get; set; }
    public bool AutoScheduled { get; set; }
    public LastChoice? LastChoice { get; set; }
    public DateTime? CompletedAt { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public User User { get; set; } = null!;
    public Library? Library { get; set; }
}
