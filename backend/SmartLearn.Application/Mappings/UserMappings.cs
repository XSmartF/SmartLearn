using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class UserMappings
{
    public static UserProfileDto ToProfileDto(this User u) => new(
        u.Id, u.Email, u.DisplayName, u.AvatarUrl, u.CreatedAt, u.UpdatedAt);

    public static UserSearchResultDto ToSearchDto(this User u) => new(
        u.Id, u.Email, u.DisplayName);

    public static UserSettingsDto ToSettingsDto(this UserSettings s) => new()
    {
        Profile = s.Profile is null ? null : new ProfileSettingsDto
        {
            DisplayName = s.Profile.DisplayName,
            Language = s.Profile.Language,
            Timezone = s.Profile.Timezone,
            Bio = s.Profile.Bio,
        },
        Notifications = s.Notifications is null ? null : new NotificationSettingsDto
        {
            EmailNotifications = s.Notifications.EmailNotifications,
            PushNotifications = s.Notifications.PushNotifications,
            StudyReminders = s.Notifications.StudyReminders,
            WeeklySummary = s.Notifications.WeeklySummary,
        },
        Study = s.Study is null ? null : new StudySettingsDto
        {
            DailyGoalMinutes = s.Study.DailyGoalMinutes,
            ReminderTime = s.Study.ReminderTime,
            AutoAddEvents = s.Study.AutoAddEvents,
        },
        Appearance = s.Appearance is null ? null : new AppearanceSettingsDto
        {
            Theme = s.Appearance.Theme,
            Density = s.Appearance.Density,
            ShowConfetti = s.Appearance.ShowConfetti,
        },
        Privacy = s.Privacy is null ? null : new PrivacySettingsDto
        {
            ProfileVisibility = s.Privacy.ProfileVisibility,
            ShareActivity = s.Privacy.ShareActivity,
            DataInsights = s.Privacy.DataInsights,
        },
    };
}
