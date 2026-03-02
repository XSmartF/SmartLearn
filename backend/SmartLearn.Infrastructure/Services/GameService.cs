using Microsoft.EntityFrameworkCore;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;
using SmartLearn.Application.Mappings;
using SmartLearn.Infrastructure.Data;

namespace SmartLearn.Infrastructure.Services;

public class GameService(SmartLearnDbContext db) : IGameService
{
    public async Task<IReadOnlyList<GameModeDto>> GetModesAsync(CancellationToken ct)
    {
        return await db.GameModes
            .AsNoTracking()
            .Select(m => m.ToDto())
            .ToListAsync(ct);
    }
}
