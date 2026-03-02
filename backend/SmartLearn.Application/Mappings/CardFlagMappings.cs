using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class CardFlagMappings
{
    public static CardFlagDto ToDto(this CardFlag f) => new(
        f.Id, f.UserId, f.LibraryId, f.CardId, f.Starred,
        f.Difficulty?.ToString().ToLowerInvariant(), f.UpdatedAt);

    public static FlagMapEntryDto ToFlagEntry(this CardFlag f) => new(
        f.Starred, f.Difficulty?.ToString().ToLowerInvariant());
}
