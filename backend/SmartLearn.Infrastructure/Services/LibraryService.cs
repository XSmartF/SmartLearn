using System.Text.Json;
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

public class LibraryService(SmartLearnDbContext db, ICurrentUserService currentUser) : ILibraryService
{
    private Guid UserId => currentUser.UserId ?? throw new ForbiddenException();

    public async Task<LibraryDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var lib = await db.Libraries.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id, ct);
        return lib?.ToDto();
    }

    public async Task<IReadOnlyList<LibraryDto>> GetUserLibrariesAsync(CancellationToken ct)
    {
        return await db.Libraries
            .AsNoTracking()
            .Where(l => l.OwnerId == UserId)
            .OrderByDescending(l => l.UpdatedAt)
            .Select(l => l.ToDto())
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<LibraryDto>> GetByIdsAsync(Guid[] ids, CancellationToken ct)
    {
        return await db.Libraries
            .AsNoTracking()
            .Where(l => ids.Contains(l.Id))
            .Select(l => l.ToDto())
            .ToListAsync(ct);
    }

    public async Task<Guid> CreateAsync(CreateLibraryRequest data, CancellationToken ct)
    {
        var lib = new Library
        {
            OwnerId = UserId,
            Title = data.Title,
            Description = data.Description,
            Subject = data.Subject,
            DifficultyLabel = data.Difficulty,
            Tags = data.Tags is { Length: > 0 } ? JsonSerializer.Serialize(data.Tags) : "[]",
            Visibility = Enum.TryParse<LibraryVisibility>(data.Visibility, true, out var v)
                ? v : LibraryVisibility.Private,
        };

        db.Libraries.Add(lib);
        await db.SaveChangesAsync(ct);
        return lib.Id;
    }

    public async Task UpdateAsync(Guid id, UpdateLibraryRequest data, CancellationToken ct)
    {
        var lib = await db.Libraries.FirstOrDefaultAsync(l => l.Id == id, ct)
            ?? throw new NotFoundException(nameof(Library), id);

        if (lib.OwnerId != UserId) throw new ForbiddenException();

        if (data.Title is not null) lib.Title = data.Title;
        if (data.Description is not null) lib.Description = data.Description;
        if (data.Subject is not null) lib.Subject = data.Subject;
        if (data.Difficulty is not null) lib.DifficultyLabel = data.Difficulty;
        if (data.Tags is not null) lib.Tags = JsonSerializer.Serialize(data.Tags);
        if (data.Visibility is not null && Enum.TryParse<LibraryVisibility>(data.Visibility, true, out var v))
            lib.Visibility = v;

        lib.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var affected = await db.Libraries
            .Where(l => l.Id == id && l.OwnerId == UserId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(l => l.IsDeleted, true)
                .SetProperty(l => l.UpdatedAt, DateTime.UtcNow), ct);

        if (affected == 0) throw new NotFoundException(nameof(Library), id);
    }

    public async Task<int> RecalcCardCountAsync(Guid libraryId, CancellationToken ct)
    {
        var count = await db.Cards.CountAsync(c => c.LibraryId == libraryId, ct);

        await db.Libraries
            .Where(l => l.Id == libraryId)
            .ExecuteUpdateAsync(s => s.SetProperty(l => l.CardCount, count), ct);

        return count;
    }
}
