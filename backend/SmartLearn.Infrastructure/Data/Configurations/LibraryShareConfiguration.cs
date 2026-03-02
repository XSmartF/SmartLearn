using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data.Configurations;

public class LibraryShareConfiguration : IEntityTypeConfiguration<LibraryShare>
{
    public void Configure(EntityTypeBuilder<LibraryShare> builder)
    {
        builder.ToTable("LibraryShares");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Role).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(e => new { e.LibraryId, e.TargetUserId }).IsUnique();

        builder.HasOne(e => e.Library)
            .WithMany(l => l.Shares)
            .HasForeignKey(e => e.LibraryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.GrantedByUser)
            .WithMany(u => u.GrantedShares)
            .HasForeignKey(e => e.GrantedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.TargetUser)
            .WithMany(u => u.ReceivedShares)
            .HasForeignKey(e => e.TargetUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
