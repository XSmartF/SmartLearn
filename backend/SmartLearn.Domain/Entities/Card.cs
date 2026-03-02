using SmartLearn.Domain.Common;
using SmartLearn.Domain.Enums;

namespace SmartLearn.Domain.Entities;

public class Card : BaseEntity
{
    public Guid LibraryId { get; set; }
    public string Front { get; set; } = string.Empty;
    public string Back { get; set; } = string.Empty;
    public Difficulty? Difficulty { get; set; }
    public string? Domain { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public Library Library { get; set; } = null!;
    public ICollection<CardFlag> Flags { get; set; } = [];
}
