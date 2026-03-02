namespace SmartLearn.Application.DTOs;

// ── Library Share ───────────────────────────────────────────────

public record LibraryShareDto(
    Guid Id,
    Guid LibraryId,
    Guid GrantedBy,
    Guid TargetUserId,
    string Role,
    DateTime CreatedAt);

public record AddShareRequest
{
    public Guid LibraryId { get; init; }
    public Guid TargetUserId { get; init; }
    public string Role { get; init; } = "viewer"; // viewer | contributor
}

public record UpdateShareRoleRequest
{
    public string Role { get; init; } = "viewer";
}
