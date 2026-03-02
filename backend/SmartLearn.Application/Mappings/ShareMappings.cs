using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class ShareMappings
{
    public static LibraryShareDto ToDto(this LibraryShare s) => new(
        s.Id, s.LibraryId, s.GrantedBy, s.TargetUserId,
        s.Role.ToString().ToLowerInvariant(), s.CreatedAt);
}
