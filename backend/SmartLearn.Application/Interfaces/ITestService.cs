using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface ITestService
{
    Task<IReadOnlyList<TestQuestionDto>> BuildSessionAsync(Guid libraryId, int questionCount, CancellationToken ct);
}
