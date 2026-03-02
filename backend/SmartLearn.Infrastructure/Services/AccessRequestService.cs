using Microsoft.EntityFrameworkCore;
using SmartLearn.Application.Common.Exceptions;
using SmartLearn.Application.Common.Interfaces;
using SmartLearn.Application.DTOs;
using SmartLearn.Application.Interfaces;
using SmartLearn.Application.Mappings;
using SmartLearn.Domain.Entities;
using SmartLearn.Domain.Enums;
using SmartLearn.Infrastructure.Data;

namespace SmartLearn.Infrastructure.Services;

public class AccessRequestService(SmartLearnDbContext db, ICurrentUserService currentUser) : IAccessRequestService
{
    private Guid UserId => currentUser.UserId ?? throw new ForbiddenException();

    public async Task<IReadOnlyList<AccessRequestDto>> GetPendingAsync(CancellationToken ct)
    {
        return await db.AccessRequests
            .AsNoTracking()
            .Where(a => a.OwnerId == UserId && a.Status == AccessRequestStatus.Pending)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => a.ToDto())
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<AccessRequestDto>> GetOwnerRequestsAsync(CancellationToken ct)
    {
        return await db.AccessRequests
            .AsNoTracking()
            .Where(a => a.OwnerId == UserId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => a.ToDto())
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<AccessRequestDto>> GetUserRequestsAsync(Guid libraryId, CancellationToken ct)
    {
        return await db.AccessRequests
            .AsNoTracking()
            .Where(a => a.RequesterId == UserId && a.LibraryId == libraryId)
            .Select(a => a.ToDto())
            .ToListAsync(ct);
    }

    public async Task<Guid> CreateAsync(CreateAccessRequestInput data, CancellationToken ct)
    {
        var ar = new AccessRequest
        {
            LibraryId = data.LibraryId,
            RequesterId = UserId,
            OwnerId = data.OwnerId,
        };

        db.AccessRequests.Add(ar);
        await db.SaveChangesAsync(ct);
        return ar.Id;
    }

    public async Task ActOnRequestAsync(Guid requestId, bool approve, CancellationToken ct)
    {
        var ar = await db.AccessRequests.FirstOrDefaultAsync(a => a.Id == requestId, ct)
            ?? throw new NotFoundException(nameof(AccessRequest), requestId);

        if (ar.OwnerId != UserId) throw new ForbiddenException();

        ar.Status = approve ? AccessRequestStatus.Approved : AccessRequestStatus.Rejected;
        ar.UpdatedAt = DateTime.UtcNow;

        if (approve)
        {
            db.LibraryShares.Add(new LibraryShare
            {
                LibraryId = ar.LibraryId,
                GrantedBy = UserId,
                TargetUserId = ar.RequesterId,
                Role = ShareRole.Viewer,
            });
        }

        await db.SaveChangesAsync(ct);
    }
}
