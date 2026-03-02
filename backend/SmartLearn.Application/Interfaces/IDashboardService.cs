using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardSnapshotDto> GetSnapshotAsync(CancellationToken ct);
}
