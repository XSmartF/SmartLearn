using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartLearn.Application.Interfaces;
using SmartLearn.Infrastructure.Data;
using SmartLearn.Infrastructure.Services;

namespace SmartLearn.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<SmartLearnDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(SmartLearnDbContext).Assembly.FullName)));

        // Services
        services.AddScoped<ILibraryService, LibraryService>();
        services.AddScoped<ICardService, CardService>();
        services.AddScoped<INoteService, NoteService>();
        services.AddScoped<IStudyEventService, StudyEventService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IShareService, ShareService>();
        services.AddScoped<IAccessRequestService, AccessRequestService>();
        services.AddScoped<IProgressService, ProgressService>();
        services.AddScoped<ICardFlagService, CardFlagService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IGameService, GameService>();
        services.AddScoped<ITestService, TestService>();

        return services;
    }
}
