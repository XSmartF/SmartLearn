using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class LibrariesController(ILibraryService libraryService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LibraryDto>>> GetMyLibraries(CancellationToken ct)
        => Ok(await libraryService.GetUserLibrariesAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LibraryDto>> GetById(Guid id, CancellationToken ct)
    {
        var lib = await libraryService.GetByIdAsync(id, ct);
        return lib is null ? NotFound() : Ok(lib);
    }

    [HttpPost("by-ids")]
    public async Task<ActionResult<IReadOnlyList<LibraryDto>>> GetByIds([FromBody] Guid[] ids, CancellationToken ct)
        => Ok(await libraryService.GetByIdsAsync(ids, ct));

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateLibraryRequest request, CancellationToken ct)
    {
        var id = await libraryService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLibraryRequest request, CancellationToken ct)
    {
        await libraryService.UpdateAsync(id, request, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await libraryService.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{libraryId:guid}/recalc-card-count")]
    public async Task<ActionResult<int>> RecalcCardCount(Guid libraryId, CancellationToken ct)
        => Ok(await libraryService.RecalcCardCountAsync(libraryId, ct));
}
