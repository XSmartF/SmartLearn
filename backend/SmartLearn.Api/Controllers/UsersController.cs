using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class UsersController(IUserService userService) : BaseApiController
{
    [HttpGet("{userId:guid}/profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile(Guid userId, CancellationToken ct)
    {
        var profile = await userService.GetProfileAsync(userId, ct);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IReadOnlyList<UserSearchResultDto>>> SearchByEmail([FromQuery] string email, CancellationToken ct)
        => Ok(await userService.FindByEmailAsync(email, ct));

    [HttpGet("settings")]
    public async Task<ActionResult<UserSettingsDto>> GetSettings(CancellationToken ct)
        => Ok(await userService.GetSettingsAsync(ct));

    [HttpPatch("settings")]
    public async Task<ActionResult<UserSettingsDto>> UpdateSettings([FromBody] UserSettingsDto patch, CancellationToken ct)
        => Ok(await userService.UpdateSettingsAsync(patch, ct));

    [HttpGet("favorites/libraries")]
    public async Task<ActionResult<IReadOnlyList<Guid>>> GetFavoriteLibraryIds(CancellationToken ct)
        => Ok(await userService.GetFavoriteLibraryIdsAsync(ct));

    [HttpPost("favorites/libraries/{libraryId:guid}")]
    public async Task<IActionResult> AddLibraryFavorite(Guid libraryId, CancellationToken ct)
    {
        await userService.AddLibraryFavoriteAsync(libraryId, ct);
        return NoContent();
    }

    [HttpDelete("favorites/libraries/{libraryId:guid}")]
    public async Task<IActionResult> RemoveLibraryFavorite(Guid libraryId, CancellationToken ct)
    {
        await userService.RemoveLibraryFavoriteAsync(libraryId, ct);
        return NoContent();
    }
}
