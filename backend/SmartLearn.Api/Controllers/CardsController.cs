using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class CardsController(ICardService cardService) : BaseApiController
{
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CardDto>> GetById(Guid id, CancellationToken ct)
    {
        var card = await cardService.GetByIdAsync(id, ct);
        return card is null ? NotFound() : Ok(card);
    }

    [HttpGet("library/{libraryId:guid}")]
    public async Task<ActionResult<IReadOnlyList<CardDto>>> GetByLibrary(Guid libraryId, CancellationToken ct)
        => Ok(await cardService.GetByLibraryAsync(libraryId, ct));

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateCardRequest request, CancellationToken ct)
    {
        var id = await cardService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPost("bulk/{libraryId:guid}")]
    public async Task<ActionResult<int>> BulkCreate(Guid libraryId, [FromBody] BulkCreateCardItem[] items, CancellationToken ct)
        => Ok(await cardService.BulkCreateAsync(libraryId, items, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCardRequest request, CancellationToken ct)
    {
        await cardService.UpdateAsync(id, request, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await cardService.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPost("bulk-delete")]
    public async Task<ActionResult<int>> BulkDelete([FromBody] Guid[] cardIds, CancellationToken ct)
        => Ok(await cardService.BulkDeleteAsync(cardIds, ct));
}
