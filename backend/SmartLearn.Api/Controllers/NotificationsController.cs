using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class NotificationsController(INotificationService notificationService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> GetMyNotifications(CancellationToken ct)
        => Ok(await notificationService.GetUserNotificationsAsync(ct));

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateNotificationRequest request, CancellationToken ct)
    {
        var id = await notificationService.CreateAsync(request, ct);
        return Ok(id);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        await notificationService.MarkReadAsync(id, ct);
        return NoContent();
    }

    [HttpPost("mark-all-read")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        await notificationService.MarkAllReadAsync(ct);
        return NoContent();
    }
}
