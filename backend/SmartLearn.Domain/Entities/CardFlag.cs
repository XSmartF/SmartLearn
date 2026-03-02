using SmartLearn.Domain.Common;
using SmartLearn.Domain.Enums;

namespace SmartLearn.Domain.Entities;

public class CardFlag : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid LibraryId { get; set; }
    public Guid CardId { get; set; }
    public bool Starred { get; set; }
    public Difficulty? Difficulty { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public User User { get; set; } = null!;
    public Library Library { get; set; } = null!;
    public Card Card { get; set; } = null!;
}
