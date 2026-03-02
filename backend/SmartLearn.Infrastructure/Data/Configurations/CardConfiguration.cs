using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data.Configurations;

public class CardConfiguration : IEntityTypeConfiguration<Card>
{
    public void Configure(EntityTypeBuilder<Card> builder)
    {
        builder.ToTable("Cards");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Front).HasMaxLength(5000).IsRequired();
        builder.Property(e => e.Back).HasMaxLength(5000).IsRequired();
        builder.Property(e => e.Difficulty).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Domain).HasMaxLength(200);

        builder.HasIndex(e => e.LibraryId);

        builder.HasOne(e => e.Library)
            .WithMany(l => l.Cards)
            .HasForeignKey(e => e.LibraryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
