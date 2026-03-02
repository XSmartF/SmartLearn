using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class NotesController(INoteService noteService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NoteDto>>> GetMyNotes(CancellationToken ct)
        => Ok(await noteService.GetUserNotesAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoteDto>> GetById(Guid id, CancellationToken ct)
    {
        var note = await noteService.GetByIdAsync(id, ct);
        return note is null ? NotFound() : Ok(note);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateNoteRequest request, CancellationToken ct)
    {
        var id = await noteService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNoteRequest request, CancellationToken ct)
    {
        await noteService.UpdateAsync(id, request, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await noteService.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpGet("favorites")]
    public async Task<ActionResult<IReadOnlyList<Guid>>> GetFavoriteIds(CancellationToken ct)
        => Ok(await noteService.GetFavoriteIdsAsync(ct));

    [HttpPost("{noteId:guid}/favorite")]
    public async Task<IActionResult> AddFavorite(Guid noteId, CancellationToken ct)
    {
        await noteService.AddFavoriteAsync(noteId, ct);
        return NoContent();
    }

    [HttpDelete("{noteId:guid}/favorite")]
    public async Task<IActionResult> RemoveFavorite(Guid noteId, CancellationToken ct)
    {
        await noteService.RemoveFavoriteAsync(noteId, ct);
        return NoContent();
    }
}
