using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data.Configurations;

public class StudyEventConfiguration : IEntityTypeConfiguration<StudyEvent>
{
    public void Configure(EntityTypeBuilder<StudyEvent> builder)
    {
        builder.ToTable("StudyEvents");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Type).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.FlashcardSet).HasMaxLength(500);
        builder.Property(e => e.LastChoice).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => new { e.UserId, e.StartTime });

        builder.HasOne(e => e.User)
            .WithMany(u => u.StudyEvents)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Library)
            .WithMany()
            .HasForeignKey(e => e.LibraryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
