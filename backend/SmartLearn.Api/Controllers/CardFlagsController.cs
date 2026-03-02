using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class CardFlagsController(ICardFlagService cardFlagService) : BaseApiController
{
    [HttpGet("library/{libraryId:guid}")]
    public async Task<ActionResult<Dictionary<string, FlagMapEntryDto>>> GetLibraryFlags(Guid libraryId, CancellationToken ct)
        => Ok(await cardFlagService.GetLibraryFlagsAsync(libraryId, ct));

    [HttpGet("review")]
    public async Task<ActionResult<IReadOnlyList<CardFlagDto>>> GetReviewFlags(CancellationToken ct)
        => Ok(await cardFlagService.GetReviewFlagsAsync(ct));

    [HttpPost("star")]
    public async Task<IActionResult> ToggleStar([FromBody] ToggleStarRequest request, CancellationToken ct)
    {
        await cardFlagService.ToggleStarAsync(request, ct);
        return NoContent();
    }

    [HttpPost("difficulty")]
    public async Task<IActionResult> SetDifficulty([FromBody] SetDifficultyRequest request, CancellationToken ct)
    {
        await cardFlagService.SetDifficultyAsync(request, ct);
        return NoContent();
    }
}
