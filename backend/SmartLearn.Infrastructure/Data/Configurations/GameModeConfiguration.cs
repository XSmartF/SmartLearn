using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Infrastructure.Data.Configurations;

public class GameModeConfiguration : IEntityTypeConfiguration<GameMode>
{
    public void Configure(EntityTypeBuilder<GameMode> builder)
    {
        builder.ToTable("GameModes");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500);

        // Seed data
        builder.HasData(
            new GameMode { Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), Title = "Quiz nhanh", Description = "Trả lời nhanh theo bộ thẻ đang học." },
            new GameMode { Id = Guid.Parse("00000000-0000-0000-0000-000000000002"), Title = "Ghép cặp", Description = "Ghép cặp mặt trước/mặt sau để tăng trí nhớ." },
            new GameMode { Id = Guid.Parse("00000000-0000-0000-0000-000000000003"), Title = "Thử thách tốc độ", Description = "Vượt giới hạn thời gian với chuỗi câu hỏi." },
            new GameMode { Id = Guid.Parse("00000000-0000-0000-0000-000000000004"), Title = "Xếp chữ", Description = "Sắp xếp lại từ và cú pháp đúng." }
        );

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
