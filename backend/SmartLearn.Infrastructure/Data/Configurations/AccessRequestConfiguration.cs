using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data.Configurations;

public class AccessRequestConfiguration : IEntityTypeConfiguration<AccessRequest>
{
    public void Configure(EntityTypeBuilder<AccessRequest> builder)
    {
        builder.ToTable("AccessRequests");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(e => new { e.RequesterId, e.LibraryId });
        builder.HasIndex(e => e.OwnerId);

        builder.HasOne(e => e.Library)
            .WithMany(l => l.AccessRequests)
            .HasForeignKey(e => e.LibraryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Requester)
            .WithMany(u => u.SentAccessRequests)
            .HasForeignKey(e => e.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Owner)
            .WithMany(u => u.ReceivedAccessRequests)
            .HasForeignKey(e => e.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
