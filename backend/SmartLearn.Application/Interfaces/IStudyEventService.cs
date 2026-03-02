using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface IStudyEventService
{
    Task<IReadOnlyList<StudyEventDto>> GetUserEventsAsync(CancellationToken ct);
    Task<StudyEventDto> CreateAsync(CreateStudyEventRequest data, CancellationToken ct);
    Task UpdateAsync(Guid id, UpdateStudyEventRequest data, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
    Task UpdateStatusAsync(Guid id, string status, CancellationToken ct);
}
