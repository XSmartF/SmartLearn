using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface ICardFlagService
{
    Task<Dictionary<string, FlagMapEntryDto>> GetLibraryFlagsAsync(Guid libraryId, CancellationToken ct);
    Task<IReadOnlyList<CardFlagDto>> GetReviewFlagsAsync(CancellationToken ct);
    Task ToggleStarAsync(ToggleStarRequest data, CancellationToken ct);
    Task SetDifficultyAsync(SetDifficultyRequest data, CancellationToken ct);
}
