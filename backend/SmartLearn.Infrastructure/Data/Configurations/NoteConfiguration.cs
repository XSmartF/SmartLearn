using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data.Configurations;

public class NoteConfiguration : IEntityTypeConfiguration<Note>
{
    public void Configure(EntityTypeBuilder<Note> builder)
    {
        builder.ToTable("Notes");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).HasMaxLength(300).IsRequired();
        builder.Property(e => e.Content).HasColumnType("nvarchar(max)");
        builder.Property(e => e.Tags).HasMaxLength(4000).HasDefaultValue("[]");
        builder.Property(e => e.Visibility).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(e => e.OwnerId);

        builder.HasOne(e => e.Owner)
            .WithMany(u => u.Notes)
            .HasForeignKey(e => e.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
