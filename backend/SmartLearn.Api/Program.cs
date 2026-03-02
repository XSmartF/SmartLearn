using Serilog;
using SmartLearn.Api.Extensions;
using SmartLearn.Application;
using SmartLearn.Infrastructure;
using SmartLearn.Infrastructure.Data;

//  Serilog bootstrap 
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console());

    //  Service registration 
    builder.Services
        .AddApplication()
        .AddInfrastructure(builder.Configuration)
        .AddJwtAuthentication(builder.Configuration)
        .AddApiControllers()
        .AddSwaggerDocumentation()
        .AddCorsPolicy(builder.Configuration);

    //  Build & run 
    var app = builder.Build();

    // Seed database (skips if data already exists)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SmartLearnDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        await db.Database.EnsureCreatedAsync();
        await SmartLearnDbSeeder.SeedAsync(db, logger);
    }

    app.UseApiPipeline();

    Log.Information("SmartLearn API starting...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
