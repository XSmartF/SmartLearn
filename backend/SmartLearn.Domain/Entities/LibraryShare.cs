using SmartLearn.Domain.Common;
using SmartLearn.Domain.Enums;

namespace SmartLearn.Domain.Entities;

public class LibraryShare : BaseEntity
{
    public Guid LibraryId { get; set; }
    public Guid GrantedBy { get; set; }
    public Guid TargetUserId { get; set; }
    public ShareRole Role { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public Library Library { get; set; } = null!;
    public User GrantedByUser { get; set; } = null!;
    public User TargetUser { get; set; } = null!;
}
