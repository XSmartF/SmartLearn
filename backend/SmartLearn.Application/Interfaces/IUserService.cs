using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface IUserService
{
    Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct);
    Task<IReadOnlyList<UserSearchResultDto>> FindByEmailAsync(string email, CancellationToken ct);
    Task<UserSettingsDto> GetSettingsAsync(CancellationToken ct);
    Task<UserSettingsDto> UpdateSettingsAsync(UserSettingsDto patch, CancellationToken ct);
    Task<IReadOnlyList<Guid>> GetFavoriteLibraryIdsAsync(CancellationToken ct);
    Task AddLibraryFavoriteAsync(Guid libraryId, CancellationToken ct);
    Task RemoveLibraryFavoriteAsync(Guid libraryId, CancellationToken ct);
}
