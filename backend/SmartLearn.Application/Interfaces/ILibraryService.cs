using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface ILibraryService
{
    Task<LibraryDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<LibraryDto>> GetUserLibrariesAsync(CancellationToken ct);
    Task<IReadOnlyList<LibraryDto>> GetByIdsAsync(Guid[] ids, CancellationToken ct);
    Task<Guid> CreateAsync(CreateLibraryRequest data, CancellationToken ct);
    Task UpdateAsync(Guid id, UpdateLibraryRequest data, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
    Task<int> RecalcCardCountAsync(Guid libraryId, CancellationToken ct);
}
