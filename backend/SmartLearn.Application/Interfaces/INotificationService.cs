using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface INotificationService
{
    Task<IReadOnlyList<NotificationDto>> GetUserNotificationsAsync(CancellationToken ct);
    Task<Guid> CreateAsync(CreateNotificationRequest data, CancellationToken ct);
    Task MarkReadAsync(Guid id, CancellationToken ct);
    Task MarkAllReadAsync(CancellationToken ct);
}
