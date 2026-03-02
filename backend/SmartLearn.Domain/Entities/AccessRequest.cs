using SmartLearn.Domain.Common;
using SmartLearn.Domain.Enums;

namespace SmartLearn.Domain.Entities;

public class AccessRequest : BaseEntity
{
    public Guid LibraryId { get; set; }
    public Guid RequesterId { get; set; }
    public Guid OwnerId { get; set; }
    public AccessRequestStatus Status { get; set; } = AccessRequestStatus.Pending;

    // ── Navigation ──────────────────────────────────────────
    public Library Library { get; set; } = null!;
    public User Requester { get; set; } = null!;
    public User Owner { get; set; } = null!;
}
