namespace SmartLearn.Application.DTOs;

// ── Dashboard ───────────────────────────────────────────────────

public record DashboardSnapshotDto(
    int TotalLibraries,
    int TotalCards,
    int DueCards,
    int UpcomingEvents,
    int UnreadNotifications,
    int StreakDays);
