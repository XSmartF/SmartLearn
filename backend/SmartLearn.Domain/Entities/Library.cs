using SmartLearn.Domain.Common;
using SmartLearn.Domain.Enums;

namespace SmartLearn.Domain.Entities;

public class Library : BaseEntity
{
    public Guid OwnerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Subject { get; set; }
    public string? DifficultyLabel { get; set; }
    public string Tags { get; set; } = "[]"; // JSON array of strings
    public LibraryVisibility Visibility { get; set; } = LibraryVisibility.Private;
    public int CardCount { get; set; }

    // ── Navigation properties ────────────────────────────────
    public User Owner { get; set; } = null!;
    public ICollection<Card> Cards { get; set; } = [];
    public ICollection<LibraryShare> Shares { get; set; } = [];
    public ICollection<AccessRequest> AccessRequests { get; set; } = [];
    public ICollection<UserLibraryProgress> Progresses { get; set; } = [];
    public ICollection<CardFlag> CardFlags { get; set; } = [];
}
