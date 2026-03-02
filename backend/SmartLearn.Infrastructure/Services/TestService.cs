using Microsoft.EntityFrameworkCore;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;
using SmartLearn.Infrastructure.Data;

namespace SmartLearn.Infrastructure.Services;

public class TestService(SmartLearnDbContext db) : ITestService
{
    public async Task<IReadOnlyList<TestQuestionDto>> BuildSessionAsync(
        Guid libraryId, int questionCount, CancellationToken ct)
    {
        // Use EF Core SQL-side random ordering for efficient random selection
        return await db.Cards
            .AsNoTracking()
            .Where(c => c.LibraryId == libraryId)
            .OrderBy(_ => EF.Functions.Random())
            .Take(questionCount)
            .Select(c => new TestQuestionDto(c.Id, c.LibraryId, c.Front, c.Back))
            .ToListAsync(ct);
    }
}
