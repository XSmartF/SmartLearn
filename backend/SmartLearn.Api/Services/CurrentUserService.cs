using System.Security.Claims;
using SmartLearn.Application.Common.Interfaces;

namespace SmartLearn.Api.Services;

/// <summary>
/// Extracts authenticated user info from HttpContext claims.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUserService(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public Guid? UserId
    {
        get
        {
            var claim = _accessor.HttpContext?.User.FindFirstValue("app_user_id");
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    public string? FirebaseUid => _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

    public bool IsAuthenticated => _accessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}
