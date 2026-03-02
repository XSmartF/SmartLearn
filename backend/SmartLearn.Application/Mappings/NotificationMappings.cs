using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class NotificationMappings
{
    public static NotificationDto ToDto(this Notification n) => new(
        n.Id, n.UserId, n.Type, n.Title, n.Message, n.Read, n.Data, n.CreatedAt);
}
