using SmartLearn.Domain.Common;
using SmartLearn.Domain.Enums;

namespace SmartLearn.Domain.Entities;

public class Note : BaseEntity
{
    public Guid OwnerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; } // BlockNote JSON
    public string Tags { get; set; } = "[]"; // JSON array of strings
    public NoteVisibility Visibility { get; set; } = NoteVisibility.Private;

    // ── Navigation ──────────────────────────────────────────
    public User Owner { get; set; } = null!;
}
