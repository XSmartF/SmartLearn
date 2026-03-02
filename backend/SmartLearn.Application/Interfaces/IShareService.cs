using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface IShareService
{
    Task<IReadOnlyList<LibraryShareDto>> GetByLibraryAsync(Guid libraryId, CancellationToken ct);
    Task<IReadOnlyList<LibraryShareDto>> GetUserSharedLibrariesAsync(CancellationToken ct);
    Task<LibraryShareDto?> GetUserShareForLibraryAsync(Guid libraryId, CancellationToken ct);
    Task AddAsync(AddShareRequest data, CancellationToken ct);
    Task RemoveAsync(Guid shareId, CancellationToken ct);
    Task UpdateRoleAsync(Guid shareId, UpdateShareRoleRequest data, CancellationToken ct);
}
