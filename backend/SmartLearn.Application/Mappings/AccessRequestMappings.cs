using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class AccessRequestMappings
{
    public static AccessRequestDto ToDto(this AccessRequest a) => new(
        a.Id, a.LibraryId, a.RequesterId, a.OwnerId,
        a.Status.ToString().ToLowerInvariant(), a.CreatedAt);
}
