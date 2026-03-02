using SmartLearn.Domain.Common;
using SmartLearn.Domain.Enums;

namespace SmartLearn.Domain.Entities;

public class UserFavorite : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid TargetId { get; set; } // LibraryId or NoteId
    public FavoriteType Type { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public User User { get; set; } = null!;
}
