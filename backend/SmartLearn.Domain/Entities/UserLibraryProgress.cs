using SmartLearn.Domain.Common;

namespace SmartLearn.Domain.Entities;

public class UserLibraryProgress : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid LibraryId { get; set; }
    public string? EngineState { get; set; } // JSON – serialized LearnEngine state

    // ── Navigation ──────────────────────────────────────────
    public User User { get; set; } = null!;
    public Library Library { get; set; } = null!;
}
