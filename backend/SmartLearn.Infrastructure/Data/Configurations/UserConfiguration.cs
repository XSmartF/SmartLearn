using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Email).HasMaxLength(320).IsRequired();
        builder.HasIndex(e => e.Email).IsUnique();
        builder.Property(e => e.DisplayName).HasMaxLength(200);
        builder.Property(e => e.AvatarUrl).HasMaxLength(2000);
        builder.Property(e => e.FirebaseUid).HasMaxLength(128);
        builder.HasIndex(e => e.FirebaseUid).IsUnique().HasFilter("[FirebaseUid] IS NOT NULL");

        // Settings stored as JSON column
        builder.OwnsOne(e => e.Settings, s =>
        {
            s.ToJson("Settings");
            s.OwnsOne(x => x.Profile);
            s.OwnsOne(x => x.Notifications);
            s.OwnsOne(x => x.Study);
            s.OwnsOne(x => x.Appearance);
            s.OwnsOne(x => x.Privacy);
        });

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
