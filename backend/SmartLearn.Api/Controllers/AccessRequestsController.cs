using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class AccessRequestsController(IAccessRequestService accessRequestService) : BaseApiController
{
    [HttpGet("pending")]
    public async Task<ActionResult<IReadOnlyList<AccessRequestDto>>> GetPending(CancellationToken ct)
        => Ok(await accessRequestService.GetPendingAsync(ct));

    [HttpGet("owner")]
    public async Task<ActionResult<IReadOnlyList<AccessRequestDto>>> GetOwnerRequests(CancellationToken ct)
        => Ok(await accessRequestService.GetOwnerRequestsAsync(ct));

    [HttpGet("library/{libraryId:guid}")]
    public async Task<ActionResult<IReadOnlyList<AccessRequestDto>>> GetUserRequests(Guid libraryId, CancellationToken ct)
        => Ok(await accessRequestService.GetUserRequestsAsync(libraryId, ct));

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateAccessRequestInput input, CancellationToken ct)
    {
        var id = await accessRequestService.CreateAsync(input, ct);
        return Ok(id);
    }

    [HttpPost("{requestId:guid}/act")]
    public async Task<IActionResult> ActOnRequest(Guid requestId, [FromBody] ActOnAccessRequestInput input, CancellationToken ct)
    {
        await accessRequestService.ActOnRequestAsync(requestId, input.Approve, ct);
        return NoContent();
    }
}
