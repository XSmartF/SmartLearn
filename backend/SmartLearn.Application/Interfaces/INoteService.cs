using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface INoteService
{
    Task<NoteDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<NoteDto>> GetUserNotesAsync(CancellationToken ct);
    Task<IReadOnlyList<Guid>> GetFavoriteIdsAsync(CancellationToken ct);
    Task<Guid> CreateAsync(CreateNoteRequest data, CancellationToken ct);
    Task UpdateAsync(Guid id, UpdateNoteRequest data, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
    Task AddFavoriteAsync(Guid noteId, CancellationToken ct);
    Task RemoveFavoriteAsync(Guid noteId, CancellationToken ct);
}
