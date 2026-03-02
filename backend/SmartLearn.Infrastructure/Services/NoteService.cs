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

public class NoteService(SmartLearnDbContext db, ICurrentUserService currentUser) : INoteService
{
    private Guid UserId => currentUser.UserId ?? throw new ForbiddenException();

    public async Task<NoteDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var note = await db.Notes.AsNoTracking().FirstOrDefaultAsync(n => n.Id == id, ct);
        return note?.ToDto();
    }

    public async Task<IReadOnlyList<NoteDto>> GetUserNotesAsync(CancellationToken ct)
    {
        return await db.Notes
            .AsNoTracking()
            .Where(n => n.OwnerId == UserId)
            .OrderByDescending(n => n.UpdatedAt)
            .Select(n => n.ToDto())
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Guid>> GetFavoriteIdsAsync(CancellationToken ct)
    {
        return await db.UserFavorites
            .AsNoTracking()
            .Where(f => f.UserId == UserId && f.Type == FavoriteType.Note)
            .Select(f => f.TargetId)
            .ToListAsync(ct);
    }

    public async Task<Guid> CreateAsync(CreateNoteRequest data, CancellationToken ct)
    {
        var note = new Note
        {
            OwnerId = UserId,
            Title = data.Title,
            Content = data.Content,
            Tags = data.Tags is { Length: > 0 } ? JsonSerializer.Serialize(data.Tags) : "[]",
            Visibility = Enum.TryParse<NoteVisibility>(data.Visibility, true, out var v)
                ? v : NoteVisibility.Private,
        };

        db.Notes.Add(note);
        await db.SaveChangesAsync(ct);
        return note.Id;
    }

    public async Task UpdateAsync(Guid id, UpdateNoteRequest data, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == id, ct)
            ?? throw new NotFoundException(nameof(Note), id);

        if (note.OwnerId != UserId) throw new ForbiddenException();

        if (data.Title is not null) note.Title = data.Title;
        if (data.Content is not null) note.Content = data.Content;
        if (data.Tags is not null) note.Tags = JsonSerializer.Serialize(data.Tags);
        if (data.Visibility is not null && Enum.TryParse<NoteVisibility>(data.Visibility, true, out var v))
            note.Visibility = v;

        note.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var affected = await db.Notes
            .Where(n => n.Id == id && n.OwnerId == UserId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.IsDeleted, true)
                .SetProperty(n => n.UpdatedAt, DateTime.UtcNow), ct);

        if (affected == 0) throw new NotFoundException(nameof(Note), id);
    }

    public async Task AddFavoriteAsync(Guid noteId, CancellationToken ct)
    {
        var exists = await db.UserFavorites.AnyAsync(
            f => f.UserId == UserId && f.TargetId == noteId && f.Type == FavoriteType.Note, ct);
        if (exists) return;

        db.UserFavorites.Add(new UserFavorite
        {
            UserId = UserId,
            TargetId = noteId,
            Type = FavoriteType.Note,
        });
        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveFavoriteAsync(Guid noteId, CancellationToken ct)
    {
        await db.UserFavorites
            .Where(f => f.UserId == UserId && f.TargetId == noteId && f.Type == FavoriteType.Note)
            .ExecuteDeleteAsync(ct);
    }
}
