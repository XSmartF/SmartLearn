using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data.Configurations;

public class LibraryConfiguration : IEntityTypeConfiguration<Library>
{
    public void Configure(EntityTypeBuilder<Library> builder)
    {
        builder.ToTable("Libraries");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Subject).HasMaxLength(100);
        builder.Property(e => e.DifficultyLabel).HasMaxLength(50);
        builder.Property(e => e.Tags).HasMaxLength(4000).HasDefaultValue("[]");
        builder.Property(e => e.Visibility).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(e => e.OwnerId);

        builder.HasOne(e => e.Owner)
            .WithMany(u => u.Libraries)
            .HasForeignKey(e => e.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
