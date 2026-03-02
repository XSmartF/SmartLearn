using Microsoft.EntityFrameworkCore;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data;

public class SmartLearnDbContext : DbContext
{
    public SmartLearnDbContext(DbContextOptions<SmartLearnDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Library> Libraries => Set<Library>();
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<StudyEvent> StudyEvents => Set<StudyEvent>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<LibraryShare> LibraryShares => Set<LibraryShare>();
    public DbSet<AccessRequest> AccessRequests => Set<AccessRequest>();
    public DbSet<UserLibraryProgress> UserLibraryProgresses => Set<UserLibraryProgress>();
    public DbSet<CardFlag> CardFlags => Set<CardFlag>();
    public DbSet<UserFavorite> UserFavorites => Set<UserFavorite>();
    public DbSet<GameMode> GameModes => Set<GameMode>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SmartLearnDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
