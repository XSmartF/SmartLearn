using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface ICardService
{
    Task<CardDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<CardDto>> GetByLibraryAsync(Guid libraryId, CancellationToken ct);
    Task<Guid> CreateAsync(CreateCardRequest data, CancellationToken ct);
    Task<int> BulkCreateAsync(Guid libraryId, BulkCreateCardItem[] items, CancellationToken ct);
    Task UpdateAsync(Guid id, UpdateCardRequest data, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
    Task<int> BulkDeleteAsync(Guid[] cardIds, CancellationToken ct);
}
