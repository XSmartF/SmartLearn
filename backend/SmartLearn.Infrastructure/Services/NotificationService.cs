using Microsoft.EntityFrameworkCore;
using SmartLearn.Application.Common.Exceptions;
using SmartLearn.Application.Common.Interfaces;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;
using SmartLearn.Application.Mappings;
using SmartLearn.Domain.Entities;
using SmartLearn.Infrastructure.Data;

namespace SmartLearn.Infrastructure.Services;

public class NotificationService(SmartLearnDbContext db, ICurrentUserService currentUser) : INotificationService
{
    private Guid UserId => currentUser.UserId ?? throw new ForbiddenException();

    public async Task<IReadOnlyList<NotificationDto>> GetUserNotificationsAsync(CancellationToken ct)
    {
        return await db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == UserId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => n.ToDto())
            .ToListAsync(ct);
    }

    public async Task<Guid> CreateAsync(CreateNotificationRequest data, CancellationToken ct)
    {
        var notif = new Notification
        {
            UserId = data.UserId,
            Type = data.Type,
            Title = data.Title,
            Message = data.Message,
            Data = data.Data,
        };

        db.Notifications.Add(notif);
        await db.SaveChangesAsync(ct);
        return notif.Id;
    }

    public async Task MarkReadAsync(Guid id, CancellationToken ct)
    {
        await db.Notifications
            .Where(n => n.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.Read, true), ct);
    }

    public async Task MarkAllReadAsync(CancellationToken ct)
    {
        await db.Notifications
            .Where(n => n.UserId == UserId && !n.Read)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.Read, true), ct);
    }
}
