using Microsoft.EntityFrameworkCore;
using SmartLearn.Application.Common.Exceptions;
using SmartLearn.Application.Common.Interfaces;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;
using SmartLearn.Domain.Enums;
using SmartLearn.Infrastructure.Data;

namespace SmartLearn.Infrastructure.Services;

public class DashboardService(SmartLearnDbContext db, ICurrentUserService currentUser) : IDashboardService
{
    public async Task<DashboardSnapshotDto> GetSnapshotAsync(CancellationToken ct)
    {
        var userId = currentUser.UserId ?? throw new ForbiddenException();

        var totalLibraries = await db.Libraries.CountAsync(l => l.OwnerId == userId, ct);

        var totalCards = await db.Libraries
            .Where(l => l.OwnerId == userId)
            .SumAsync(l => l.CardCount, ct);

        var upcomingEvents = await db.StudyEvents
            .CountAsync(e => e.UserId == userId && e.Status == StudyEventStatus.Upcoming, ct);

        var unreadNotifications = await db.Notifications
            .CountAsync(n => n.UserId == userId && !n.Read, ct);

        return new DashboardSnapshotDto(totalLibraries, totalCards, 0, upcomingEvents, unreadNotifications, 0);
    }
}
