using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data.Configurations;

public class CardFlagConfiguration : IEntityTypeConfiguration<CardFlag>
{
    public void Configure(EntityTypeBuilder<CardFlag> builder)
    {
        builder.ToTable("CardFlags");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Difficulty).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(e => new { e.UserId, e.CardId }).IsUnique();
        builder.HasIndex(e => new { e.UserId, e.LibraryId });

        builder.HasOne(e => e.User)
            .WithMany(u => u.CardFlags)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Library)
            .WithMany(l => l.CardFlags)
            .HasForeignKey(e => e.LibraryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Card)
            .WithMany(c => c.Flags)
            .HasForeignKey(e => e.CardId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
