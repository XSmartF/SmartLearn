using Microsoft.EntityFrameworkCore;
using SmartLearn.Application.Common.Exceptions;
using SmartLearn.Application.Common.Interfaces;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;
using SmartLearn.Application.Mappings;
using SmartLearn.Domain.Entities;
using SmartLearn.Infrastructure.Data;

namespace SmartLearn.Infrastructure.Services;

public class ProgressService(SmartLearnDbContext db, ICurrentUserService currentUser) : IProgressService
{
    private Guid UserId => currentUser.UserId ?? throw new ForbiddenException();

    public async Task<UserLibraryProgressDto?> GetAsync(Guid libraryId, CancellationToken ct)
    {
        var p = await db.UserLibraryProgresses
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == UserId && p.LibraryId == libraryId, ct);
        return p?.ToDto();
    }

    public async Task<ProgressStatsDto> GetStatsAsync(Guid libraryId, CancellationToken ct)
    {
        // Basic stats — extend with real calculations later
        return new ProgressStatsDto(0, 0, 0, 0);
    }

    public async Task<IReadOnlyList<UserLibraryProgressDto>> GetAllForLibraryAsync(Guid libraryId, CancellationToken ct)
    {
        return await db.UserLibraryProgresses
            .AsNoTracking()
            .Where(p => p.LibraryId == libraryId)
            .Select(p => p.ToDto())
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ProgressSummaryDto>> GetSummariesAsync(Guid libraryId, CancellationToken ct)
    {
        return await db.UserLibraryProgresses
            .AsNoTracking()
            .Where(p => p.LibraryId == libraryId)
            .Select(p => p.ToSummary())
            .ToListAsync(ct);
    }

    public async Task<Guid> UpsertAsync(Guid libraryId, UpsertProgressRequest data, CancellationToken ct)
    {
        var existing = await db.UserLibraryProgresses
            .FirstOrDefaultAsync(p => p.UserId == UserId && p.LibraryId == libraryId, ct);

        if (existing is not null)
        {
            existing.EngineState = data.EngineState;
            existing.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
            return existing.Id;
        }

        var progress = new UserLibraryProgress
        {
            UserId = UserId,
            LibraryId = libraryId,
            EngineState = data.EngineState,
        };

        db.UserLibraryProgresses.Add(progress);
        await db.SaveChangesAsync(ct);
        return progress.Id;
    }
}
