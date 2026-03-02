using SmartLearn.Api.Middleware;

namespace SmartLearn.Api.Extensions;

public static class MiddlewareSetup
{
    public static WebApplication UseApiPipeline(this WebApplication app)
    {
        app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
        app.UseSwaggerDocumentation();
        app.UseHttpsRedirection();
        app.UseCors(CorsSetup.PolicyName);
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        return app;
    }
}
