using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface IProgressService
{
    Task<UserLibraryProgressDto?> GetAsync(Guid libraryId, CancellationToken ct);
    Task<ProgressStatsDto> GetStatsAsync(Guid libraryId, CancellationToken ct);
    Task<IReadOnlyList<UserLibraryProgressDto>> GetAllForLibraryAsync(Guid libraryId, CancellationToken ct);
    Task<IReadOnlyList<ProgressSummaryDto>> GetSummariesAsync(Guid libraryId, CancellationToken ct);
    Task<Guid> UpsertAsync(Guid libraryId, UpsertProgressRequest data, CancellationToken ct);
}
