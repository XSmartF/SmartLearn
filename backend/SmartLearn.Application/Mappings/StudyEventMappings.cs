using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class StudyEventMappings
{
    public static StudyEventDto ToDto(this StudyEvent e) => new(
        e.Id, e.UserId, e.Title, e.Description, e.StartTime, e.EndTime,
        e.Type.ToString().ToLowerInvariant(),
        e.Status.ToString().ToLowerInvariant(),
        e.FlashcardSet, e.CardCount, e.CardId, e.LibraryId,
        e.AutoScheduled, e.LastChoice?.ToString(),
        e.CompletedAt, e.CreatedAt, e.UpdatedAt);
}
