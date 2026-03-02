using Microsoft.EntityFrameworkCore;
using SmartLearn.Application.Common.Exceptions;
using SmartLearn.Application.Common.Interfaces;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;
using SmartLearn.Application.Mappings;
using SmartLearn.Domain.Entities;
using SmartLearn.Domain.Enums;
using SmartLearn.Infrastructure.Data;

namespace SmartLearn.Infrastructure.Services;

public class UserService(SmartLearnDbContext db, ICurrentUserService currentUser) : IUserService
{
    private Guid UserId => currentUser.UserId ?? throw new ForbiddenException();

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct)
    {
        return await db.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new UserProfileDto(u.Id, u.Email, u.DisplayName, u.AvatarUrl, u.CreatedAt, u.UpdatedAt))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<UserSearchResultDto>> FindByEmailAsync(string email, CancellationToken ct)
    {
        return await db.Users
            .AsNoTracking()
            .Where(u => u.Email.Contains(email))
            .Select(u => new UserSearchResultDto(u.Id, u.Email, u.DisplayName))
            .Take(20)
            .ToListAsync(ct);
    }

    public async Task<UserSettingsDto> GetSettingsAsync(CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == UserId, ct)
            ?? throw new NotFoundException(nameof(User), UserId);

        return user.Settings.ToSettingsDto();
    }

    public async Task<UserSettingsDto> UpdateSettingsAsync(UserSettingsDto patch, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == UserId, ct)
            ?? throw new NotFoundException(nameof(User), UserId);

        var s = user.Settings ??= new UserSettings();

        if (patch.Profile is not null)
        {
            s.Profile ??= new ProfileSettings();
            if (patch.Profile.DisplayName is not null) s.Profile.DisplayName = patch.Profile.DisplayName;
            if (patch.Profile.Language is not null) s.Profile.Language = patch.Profile.Language;
            if (patch.Profile.Timezone is not null) s.Profile.Timezone = patch.Profile.Timezone;
            if (patch.Profile.Bio is not null) s.Profile.Bio = patch.Profile.Bio;
        }

        if (patch.Notifications is not null)
        {
            s.Notifications ??= new NotificationSettings();
            if (patch.Notifications.EmailNotifications.HasValue)
                s.Notifications.EmailNotifications = patch.Notifications.EmailNotifications;
            if (patch.Notifications.PushNotifications.HasValue)
                s.Notifications.PushNotifications = patch.Notifications.PushNotifications;
            if (patch.Notifications.StudyReminders.HasValue)
                s.Notifications.StudyReminders = patch.Notifications.StudyReminders;
            if (patch.Notifications.WeeklySummary.HasValue)
                s.Notifications.WeeklySummary = patch.Notifications.WeeklySummary;
        }

        if (patch.Study is not null)
        {
            s.Study ??= new StudySettings();
            if (patch.Study.DailyGoalMinutes.HasValue) s.Study.DailyGoalMinutes = patch.Study.DailyGoalMinutes;
            if (patch.Study.ReminderTime is not null) s.Study.ReminderTime = patch.Study.ReminderTime;
            if (patch.Study.AutoAddEvents.HasValue) s.Study.AutoAddEvents = patch.Study.AutoAddEvents;
        }

        if (patch.Appearance is not null)
        {
            s.Appearance ??= new AppearanceSettings();
            if (patch.Appearance.Theme is not null) s.Appearance.Theme = patch.Appearance.Theme;
            if (patch.Appearance.Density is not null) s.Appearance.Density = patch.Appearance.Density;
            if (patch.Appearance.ShowConfetti.HasValue) s.Appearance.ShowConfetti = patch.Appearance.ShowConfetti;
        }

        if (patch.Privacy is not null)
        {
            s.Privacy ??= new PrivacySettings();
            if (patch.Privacy.ProfileVisibility is not null)
                s.Privacy.ProfileVisibility = patch.Privacy.ProfileVisibility;
            if (patch.Privacy.ShareActivity.HasValue) s.Privacy.ShareActivity = patch.Privacy.ShareActivity;
            if (patch.Privacy.DataInsights.HasValue) s.Privacy.DataInsights = patch.Privacy.DataInsights;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return patch;
    }

    public async Task<IReadOnlyList<Guid>> GetFavoriteLibraryIdsAsync(CancellationToken ct)
    {
        return await db.UserFavorites
            .AsNoTracking()
            .Where(f => f.UserId == UserId && f.Type == FavoriteType.Library)
            .Select(f => f.TargetId)
            .ToListAsync(ct);
    }

    public async Task AddLibraryFavoriteAsync(Guid libraryId, CancellationToken ct)
    {
        var exists = await db.UserFavorites.AnyAsync(
            f => f.UserId == UserId && f.TargetId == libraryId && f.Type == FavoriteType.Library, ct);
        if (exists) return;

        db.UserFavorites.Add(new UserFavorite
        {
            UserId = UserId,
            TargetId = libraryId,
            Type = FavoriteType.Library,
        });
        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveLibraryFavoriteAsync(Guid libraryId, CancellationToken ct)
    {
        await db.UserFavorites
            .Where(f => f.UserId == UserId && f.TargetId == libraryId && f.Type == FavoriteType.Library)
            .ExecuteDeleteAsync(ct);
    }
}
