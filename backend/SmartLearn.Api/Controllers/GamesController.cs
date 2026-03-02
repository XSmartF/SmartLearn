using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class GamesController(IGameService gameService) : BaseApiController
{
    [HttpGet("modes")]
    public async Task<ActionResult<IReadOnlyList<GameModeDto>>> GetModes(CancellationToken ct)
        => Ok(await gameService.GetModesAsync(ct));
}
