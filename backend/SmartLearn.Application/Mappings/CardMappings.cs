using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class CardMappings
{
    public static CardDto ToDto(this Card c) => new(
        c.Id, c.LibraryId, c.Front, c.Back,
        c.Difficulty?.ToString().ToLowerInvariant(),
        c.Domain, c.CreatedAt, c.UpdatedAt);
}
