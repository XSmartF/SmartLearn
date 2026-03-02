namespace SmartLearn.Application.DTOs;

// ── User ────────────────────────────────────────────────────────

public record UserProfileDto(
    Guid Id,
    string Email,
    string? DisplayName,
    string? AvatarUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record UserSearchResultDto(
    Guid Id,
    string? Email,
    string? DisplayName);

// ── Settings ────────────────────────────────────────────────────

public record UserSettingsDto
{
    public ProfileSettingsDto? Profile { get; init; }
    public NotificationSettingsDto? Notifications { get; init; }
    public StudySettingsDto? Study { get; init; }
    public AppearanceSettingsDto? Appearance { get; init; }
    public PrivacySettingsDto? Privacy { get; init; }
}

public record ProfileSettingsDto
{
    public string? DisplayName { get; init; }
    public string? Language { get; init; }
    public string? Timezone { get; init; }
    public string? Bio { get; init; }
}

public record NotificationSettingsDto
{
    public bool? EmailNotifications { get; init; }
    public bool? PushNotifications { get; init; }
    public bool? StudyReminders { get; init; }
    public bool? WeeklySummary { get; init; }
}

public record StudySettingsDto
{
    public int? DailyGoalMinutes { get; init; }
    public string? ReminderTime { get; init; }
    public bool? AutoAddEvents { get; init; }
}

public record AppearanceSettingsDto
{
    public string? Theme { get; init; }
    public string? Density { get; init; }
    public bool? ShowConfetti { get; init; }
}

public record PrivacySettingsDto
{
    public string? ProfileVisibility { get; init; }
    public bool? ShareActivity { get; init; }
    public bool? DataInsights { get; init; }
}
