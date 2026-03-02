using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class ProgressController(IProgressService progressService) : BaseApiController
{
    [HttpGet("{libraryId:guid}")]
    public async Task<ActionResult<UserLibraryProgressDto>> GetProgress(Guid libraryId, CancellationToken ct)
    {
        var p = await progressService.GetAsync(libraryId, ct);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpGet("{libraryId:guid}/stats")]
    public async Task<ActionResult<ProgressStatsDto>> GetStats(Guid libraryId, CancellationToken ct)
        => Ok(await progressService.GetStatsAsync(libraryId, ct));

    [HttpGet("{libraryId:guid}/all")]
    public async Task<ActionResult<IReadOnlyList<UserLibraryProgressDto>>> GetAllForLibrary(Guid libraryId, CancellationToken ct)
        => Ok(await progressService.GetAllForLibraryAsync(libraryId, ct));

    [HttpGet("{libraryId:guid}/summaries")]
    public async Task<ActionResult<IReadOnlyList<ProgressSummaryDto>>> GetSummaries(Guid libraryId, CancellationToken ct)
        => Ok(await progressService.GetSummariesAsync(libraryId, ct));

    [HttpPut("{libraryId:guid}")]
    public async Task<ActionResult<Guid>> Upsert(Guid libraryId, [FromBody] UpsertProgressRequest request, CancellationToken ct)
        => Ok(await progressService.UpsertAsync(libraryId, request, ct));
}
