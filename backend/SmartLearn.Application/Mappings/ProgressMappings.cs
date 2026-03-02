using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class ProgressMappings
{
    public static UserLibraryProgressDto ToDto(this UserLibraryProgress p) => new(
        p.Id, p.UserId, p.LibraryId, p.EngineState, p.UpdatedAt);

    public static ProgressSummaryDto ToSummary(this UserLibraryProgress p) => new(
        p.UserId, p.LibraryId, 0, 0, 0, 0, 0, p.UpdatedAt);
}
