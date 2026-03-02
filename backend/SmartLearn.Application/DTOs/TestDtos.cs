namespace SmartLearn.Application.DTOs;

// ── Test ────────────────────────────────────────────────────────

public record TestQuestionDto(
    Guid Id,
    Guid LibraryId,
    string Prompt,
    string Answer);

public record BuildTestRequest
{
    public Guid LibraryId { get; init; }
    public int QuestionCount { get; init; } = 10;
}
