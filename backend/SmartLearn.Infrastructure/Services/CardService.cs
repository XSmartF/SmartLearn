using Microsoft.EntityFrameworkCore;
using SmartLearn.Application.Common.Exceptions;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;
using SmartLearn.Application.Mappings;
using SmartLearn.Domain.Entities;
using SmartLearn.Domain.Enums;
using SmartLearn.Infrastructure.Data;

namespace SmartLearn.Infrastructure.Services;

public class CardService(SmartLearnDbContext db) : ICardService
{
    public async Task<CardDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var card = await db.Cards.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct);
        return card?.ToDto();
    }

    public async Task<IReadOnlyList<CardDto>> GetByLibraryAsync(Guid libraryId, CancellationToken ct)
    {
        return await db.Cards
            .AsNoTracking()
            .Where(c => c.LibraryId == libraryId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => c.ToDto())
            .ToListAsync(ct);
    }

    public async Task<Guid> CreateAsync(CreateCardRequest data, CancellationToken ct)
    {
        var card = new Card
        {
            LibraryId = data.LibraryId,
            Front = data.Front,
            Back = data.Back,
            Domain = data.Domain,
            Difficulty = Enum.TryParse<Difficulty>(data.Difficulty, true, out var diff) ? diff : null,
        };

        db.Cards.Add(card);
        await db.SaveChangesAsync(ct);
        return card.Id;
    }

    public async Task<int> BulkCreateAsync(Guid libraryId, BulkCreateCardItem[] items, CancellationToken ct)
    {
        var cards = items.Select(i => new Card
        {
            LibraryId = libraryId,
            Front = i.Front,
            Back = i.Back,
            Domain = i.Domain,
        });

        db.Cards.AddRange(cards);
        return await db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Guid id, UpdateCardRequest data, CancellationToken ct)
    {
        var card = await db.Cards.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Card), id);

        if (data.Front is not null) card.Front = data.Front;
        if (data.Back is not null) card.Back = data.Back;
        if (data.Domain is not null) card.Domain = data.Domain == "" ? null : data.Domain;
        if (data.Difficulty is not null)
            card.Difficulty = Enum.TryParse<Difficulty>(data.Difficulty, true, out var diff) ? diff : null;

        card.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var affected = await db.Cards.Where(c => c.Id == id).ExecuteDeleteAsync(ct);
        if (affected == 0) throw new NotFoundException(nameof(Card), id);
    }

    public async Task<int> BulkDeleteAsync(Guid[] cardIds, CancellationToken ct)
    {
        return await db.Cards
            .Where(c => cardIds.Contains(c.Id))
            .ExecuteDeleteAsync(ct);
    }
}
