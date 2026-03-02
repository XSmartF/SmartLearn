using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class SharesController(IShareService shareService) : BaseApiController
{
    [HttpGet("library/{libraryId:guid}")]
    public async Task<ActionResult<IReadOnlyList<LibraryShareDto>>> GetByLibrary(Guid libraryId, CancellationToken ct)
        => Ok(await shareService.GetByLibraryAsync(libraryId, ct));

    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyList<LibraryShareDto>>> GetMySharedLibraries(CancellationToken ct)
        => Ok(await shareService.GetUserSharedLibrariesAsync(ct));

    [HttpGet("library/{libraryId:guid}/mine")]
    public async Task<ActionResult<LibraryShareDto>> GetMyShareForLibrary(Guid libraryId, CancellationToken ct)
    {
        var share = await shareService.GetUserShareForLibraryAsync(libraryId, ct);
        return share is null ? NotFound() : Ok(share);
    }

    [HttpPost]
    public async Task<IActionResult> AddShare([FromBody] AddShareRequest request, CancellationToken ct)
    {
        await shareService.AddAsync(request, ct);
        return NoContent();
    }

    [HttpDelete("{shareId:guid}")]
    public async Task<IActionResult> RemoveShare(Guid shareId, CancellationToken ct)
    {
        await shareService.RemoveAsync(shareId, ct);
        return NoContent();
    }

    [HttpPatch("{shareId:guid}/role")]
    public async Task<IActionResult> UpdateRole(Guid shareId, [FromBody] UpdateShareRoleRequest request, CancellationToken ct)
    {
        await shareService.UpdateRoleAsync(shareId, request, ct);
        return NoContent();
    }
}
