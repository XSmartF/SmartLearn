namespace SmartLearn.Application.DTOs;

// ── Game Mode ───────────────────────────────────────────────────

public record GameModeDto(
    Guid Id,
    string Title,
    string Description);
