using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;

namespace SmartLearn.Api.Controllers;

[Authorize]
public class TestsController(ITestService testService) : BaseApiController
{
    [HttpPost("session")]
    public async Task<ActionResult<IReadOnlyList<TestQuestionDto>>> BuildSession([FromBody] BuildTestRequest request, CancellationToken ct)
        => Ok(await testService.BuildSessionAsync(request.LibraryId, request.QuestionCount, ct));
}
