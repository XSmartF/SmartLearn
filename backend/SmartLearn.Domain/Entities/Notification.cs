using SmartLearn.Domain.Common;

namespace SmartLearn.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool Read { get; set; }
    public string? Data { get; set; } // JSON object

    // ── Navigation ──────────────────────────────────────────
    public User User { get; set; } = null!;
}
