using SmartLearn.Application.DTOs;

namespace SmartLearn.Application.Interfaces;

public interface IAccessRequestService
{
    Task<IReadOnlyList<AccessRequestDto>> GetPendingAsync(CancellationToken ct);
    Task<IReadOnlyList<AccessRequestDto>> GetOwnerRequestsAsync(CancellationToken ct);
    Task<IReadOnlyList<AccessRequestDto>> GetUserRequestsAsync(Guid libraryId, CancellationToken ct);
    Task<Guid> CreateAsync(CreateAccessRequestInput data, CancellationToken ct);
    Task ActOnRequestAsync(Guid requestId, bool approve, CancellationToken ct);
}
