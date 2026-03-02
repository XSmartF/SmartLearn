using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class StudyEventsController(IStudyEventService studyEventService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<StudyEventDto>>> GetMyEvents(CancellationToken ct)
        => Ok(await studyEventService.GetUserEventsAsync(ct));

    [HttpPost]
    public async Task<ActionResult<StudyEventDto>> Create([FromBody] CreateStudyEventRequest request, CancellationToken ct)
    {
        var ev = await studyEventService.CreateAsync(request, ct);
        return CreatedAtAction(null, ev);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStudyEventRequest request, CancellationToken ct)
    {
        await studyEventService.UpdateAsync(id, request, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await studyEventService.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status, CancellationToken ct)
    {
        await studyEventService.UpdateStatusAsync(id, status, ct);
        return NoContent();
    }
}
