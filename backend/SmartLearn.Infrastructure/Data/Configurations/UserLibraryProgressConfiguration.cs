using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data.Configurations;

public class UserLibraryProgressConfiguration : IEntityTypeConfiguration<UserLibraryProgress>
{
    public void Configure(EntityTypeBuilder<UserLibraryProgress> builder)
    {
        builder.ToTable("UserLibraryProgresses");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.EngineState).HasColumnType("nvarchar(max)");

        builder.HasIndex(e => new { e.UserId, e.LibraryId }).IsUnique();

        builder.HasOne(e => e.User)
            .WithMany(u => u.Progresses)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Library)
            .WithMany(l => l.Progresses)
            .HasForeignKey(e => e.LibraryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
