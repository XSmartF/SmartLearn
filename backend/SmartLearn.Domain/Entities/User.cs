using SmartLearn.Domain.Common;

namespace SmartLearn.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? FirebaseUid { get; set; }

    // ── Settings (stored as JSON column) ─────────────────────
    public UserSettings Settings { get; set; } = new();

    // ── Navigation properties ────────────────────────────────
    public ICollection<Library> Libraries { get; set; } = [];
    public ICollection<Note> Notes { get; set; } = [];
    public ICollection<StudyEvent> StudyEvents { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<UserLibraryProgress> Progresses { get; set; } = [];
    public ICollection<CardFlag> CardFlags { get; set; } = [];
    public ICollection<UserFavorite> Favorites { get; set; } = [];
    public ICollection<LibraryShare> GrantedShares { get; set; } = [];
    public ICollection<LibraryShare> ReceivedShares { get; set; } = [];
    public ICollection<AccessRequest> SentAccessRequests { get; set; } = [];
    public ICollection<AccessRequest> ReceivedAccessRequests { get; set; } = [];
}

// ── Settings value objects ──────────────────────────────────────

public class UserSettings
{
    public ProfileSettings? Profile { get; set; }
    public NotificationSettings? Notifications { get; set; }
    public StudySettings? Study { get; set; }
    public AppearanceSettings? Appearance { get; set; }
    public PrivacySettings? Privacy { get; set; }
}

public class ProfileSettings
{
    public string? DisplayName { get; set; }
    public string? Language { get; set; }
    public string? Timezone { get; set; }
    public string? Bio { get; set; }
}

public class NotificationSettings
{
    public bool? EmailNotifications { get; set; }
    public bool? PushNotifications { get; set; }
    public bool? StudyReminders { get; set; }
    public bool? WeeklySummary { get; set; }
}

public class StudySettings
{
    public int? DailyGoalMinutes { get; set; }
    public string? ReminderTime { get; set; }
    public bool? AutoAddEvents { get; set; }
}

public class AppearanceSettings
{
    public string? Theme { get; set; } // system | light | dark
    public string? Density { get; set; } // comfortable | compact | spacious
    public bool? ShowConfetti { get; set; }
}

public class PrivacySettings
{
    public string? ProfileVisibility { get; set; } // public | friends | private
    public bool? ShareActivity { get; set; }
    public bool? DataInsights { get; set; }
}
