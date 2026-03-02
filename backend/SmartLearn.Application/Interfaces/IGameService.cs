using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface IGameService
{
    Task<IReadOnlyList<GameModeDto>> GetModesAsync(CancellationToken ct);
}
