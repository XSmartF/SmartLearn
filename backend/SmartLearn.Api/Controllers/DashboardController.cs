using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class DashboardController(IDashboardService dashboardService) : BaseApiController
{
    [HttpGet("snapshot")]
    public async Task<ActionResult<DashboardSnapshotDto>> GetSnapshot(CancellationToken ct)
        => Ok(await dashboardService.GetSnapshotAsync(ct));
}
