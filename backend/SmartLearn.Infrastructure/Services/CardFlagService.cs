using Microsoft.EntityFrameworkCore;
using SmartLearn.Application.Common.Exceptions;
using SmartLearn.Application.Common.Interfaces;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;
using SmartLearn.Application.Mappings;
using SmartLearn.Domain.Entities;
using SmartLearn.Domain.Enums;
using SmartLearn.Infrastructure.Data;

namespace SmartLearn.Infrastructure.Services;

public class CardFlagService(SmartLearnDbContext db, ICurrentUserService currentUser) : ICardFlagService
{
    private Guid UserId => currentUser.UserId ?? throw new ForbiddenException();

    public async Task<Dictionary<string, FlagMapEntryDto>> GetLibraryFlagsAsync(Guid libraryId, CancellationToken ct)
    {
        return await db.CardFlags
            .AsNoTracking()
            .Where(f => f.UserId == UserId && f.LibraryId == libraryId)
            .ToDictionaryAsync(
                f => f.CardId.ToString(),
                f => f.ToFlagEntry(),
                ct);
    }

    public async Task<IReadOnlyList<CardFlagDto>> GetReviewFlagsAsync(CancellationToken ct)
    {
        return await db.CardFlags
            .AsNoTracking()
            .Where(f => f.UserId == UserId && (f.Starred || f.Difficulty != null))
            .Select(f => f.ToDto())
            .ToListAsync(ct);
    }

    public async Task ToggleStarAsync(ToggleStarRequest data, CancellationToken ct)
    {
        var flag = await db.CardFlags
            .FirstOrDefaultAsync(f => f.UserId == UserId && f.CardId == data.CardId, ct);

        if (flag is null)
        {
            db.CardFlags.Add(new CardFlag
            {
                UserId = UserId,
                LibraryId = data.LibraryId,
                CardId = data.CardId,
                Starred = data.Starred,
            });
        }
        else
        {
            flag.Starred = data.Starred;
            flag.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task SetDifficultyAsync(SetDifficultyRequest data, CancellationToken ct)
    {
        var difficulty = Enum.TryParse<Difficulty>(data.Difficulty, true, out var diff) ? diff : Difficulty.Medium;

        var flag = await db.CardFlags
            .FirstOrDefaultAsync(f => f.UserId == UserId && f.CardId == data.CardId, ct);

        if (flag is null)
        {
            db.CardFlags.Add(new CardFlag
            {
                UserId = UserId,
                LibraryId = data.LibraryId,
                CardId = data.CardId,
                Difficulty = difficulty,
            });
        }
        else
        {
            flag.Difficulty = difficulty;
            flag.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
    }
}
