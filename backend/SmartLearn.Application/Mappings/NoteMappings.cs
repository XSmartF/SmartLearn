using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class NoteMappings
{
    public static NoteDto ToDto(this Note n) => new(
        n.Id, n.OwnerId, n.Title, n.Content,
        LibraryMappings.DeserializeJsonTags(n.Tags),
        n.Visibility.ToString().ToLowerInvariant(),
        n.CreatedAt, n.UpdatedAt);
}
