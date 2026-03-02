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

public class StudyEventService(SmartLearnDbContext db, ICurrentUserService currentUser) : IStudyEventService
{
    private Guid UserId => currentUser.UserId ?? throw new ForbiddenException();

    public async Task<IReadOnlyList<StudyEventDto>> GetUserEventsAsync(CancellationToken ct)
    {
        return await db.StudyEvents
            .AsNoTracking()
            .Where(e => e.UserId == UserId)
            .OrderByDescending(e => e.StartTime)
            .Select(e => e.ToDto())
            .ToListAsync(ct);
    }

    public async Task<StudyEventDto> CreateAsync(CreateStudyEventRequest data, CancellationToken ct)
    {
        var ev = new StudyEvent
        {
            UserId = UserId,
            Title = data.Title,
            Description = data.Description,
            StartTime = data.StartTime,
            EndTime = data.EndTime,
            Type = Enum.TryParse<StudyEventType>(data.Type, true, out var t) ? t : StudyEventType.Study,
            FlashcardSet = data.FlashcardSet,
            CardCount = data.CardCount,
            CardId = data.CardId,
            LibraryId = data.LibraryId,
        };

        db.StudyEvents.Add(ev);
        await db.SaveChangesAsync(ct);
        return ev.ToDto();
    }

    public async Task UpdateAsync(Guid id, UpdateStudyEventRequest data, CancellationToken ct)
    {
        var ev = await db.StudyEvents.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(StudyEvent), id);

        if (ev.UserId != UserId) throw new ForbiddenException();

        if (data.Title is not null) ev.Title = data.Title;
        if (data.Description is not null) ev.Description = data.Description;
        if (data.StartTime.HasValue) ev.StartTime = data.StartTime.Value;
        if (data.EndTime.HasValue) ev.EndTime = data.EndTime.Value;
        if (data.Type is not null && Enum.TryParse<StudyEventType>(data.Type, true, out var t)) ev.Type = t;
        if (data.FlashcardSet is not null) ev.FlashcardSet = data.FlashcardSet;
        if (data.CardCount.HasValue) ev.CardCount = data.CardCount.Value;
        if (data.CardId.HasValue) ev.CardId = data.CardId;
        if (data.LibraryId.HasValue) ev.LibraryId = data.LibraryId;

        ev.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var affected = await db.StudyEvents
            .Where(e => e.Id == id && e.UserId == UserId)
            .ExecuteDeleteAsync(ct);

        if (affected == 0) throw new NotFoundException(nameof(StudyEvent), id);
    }

    public async Task UpdateStatusAsync(Guid id, string status, CancellationToken ct)
    {
        var ev = await db.StudyEvents.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(StudyEvent), id);

        if (ev.UserId != UserId) throw new ForbiddenException();

        if (Enum.TryParse<StudyEventStatus>(status, true, out var s))
        {
            ev.Status = s;
            if (s == StudyEventStatus.Completed) ev.CompletedAt = DateTime.UtcNow;
        }

        ev.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
