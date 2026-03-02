namespace SmartLearn.Api.Extensions;

public static class CorsSetup
{
    public const string PolicyName = "AllowFrontend";

    public static IServiceCollection AddCorsPolicy(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                policy.WithOrigins(
                        configuration.GetSection("Cors:Origins").Get<string[]>()
                        ?? ["http://localhost:5173", "http://localhost:3000", "http://smartlearnapp.runasp.net"])
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }
}
