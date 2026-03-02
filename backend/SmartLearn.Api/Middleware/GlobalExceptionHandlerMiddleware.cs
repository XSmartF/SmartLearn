using System.Net;
using System.Text.Json;
using SmartLearn.Application.Common.Exceptions;

namespace SmartLearn.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, response) = exception switch
        {
            ValidationException ve => (HttpStatusCode.BadRequest, new ErrorResponse
            {
                Status = 400,
                Title = "Validation Error",
                Errors = ve.Errors
            }),
            NotFoundException => (HttpStatusCode.NotFound, new ErrorResponse
            {
                Status = 404,
                Title = exception.Message
            }),
            ForbiddenException => (HttpStatusCode.Forbidden, new ErrorResponse
            {
                Status = 403,
                Title = exception.Message
            }),
            _ => (HttpStatusCode.InternalServerError, new ErrorResponse
            {
                Status = 500,
                Title = "An unexpected error occurred."
            })
        };

        if (statusCode == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Unhandled exception");

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        });
        await context.Response.WriteAsync(json);
    }
}

public class ErrorResponse
{
    public int Status { get; set; }
    public string Title { get; set; } = string.Empty;
    public IDictionary<string, string[]>? Errors { get; set; }
}
