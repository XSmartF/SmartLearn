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

public class ShareService(SmartLearnDbContext db, ICurrentUserService currentUser) : IShareService
{
    private Guid UserId => currentUser.UserId ?? throw new ForbiddenException();

    public async Task<IReadOnlyList<LibraryShareDto>> GetByLibraryAsync(Guid libraryId, CancellationToken ct)
    {
        return await db.LibraryShares
            .AsNoTracking()
            .Where(s => s.LibraryId == libraryId)
            .Select(s => s.ToDto())
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<LibraryShareDto>> GetUserSharedLibrariesAsync(CancellationToken ct)
    {
        return await db.LibraryShares
            .AsNoTracking()
            .Where(s => s.TargetUserId == UserId)
            .Select(s => s.ToDto())
            .ToListAsync(ct);
    }

    public async Task<LibraryShareDto?> GetUserShareForLibraryAsync(Guid libraryId, CancellationToken ct)
    {
        var share = await db.LibraryShares
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.LibraryId == libraryId && s.TargetUserId == UserId, ct);
        return share?.ToDto();
    }

    public async Task AddAsync(AddShareRequest data, CancellationToken ct)
    {
        var share = new LibraryShare
        {
            LibraryId = data.LibraryId,
            GrantedBy = UserId,
            TargetUserId = data.TargetUserId,
            Role = Enum.TryParse<ShareRole>(data.Role, true, out var r) ? r : ShareRole.Viewer,
        };

        db.LibraryShares.Add(share);
        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveAsync(Guid shareId, CancellationToken ct)
    {
        var affected = await db.LibraryShares
            .Where(s => s.Id == shareId)
            .ExecuteDeleteAsync(ct);

        if (affected == 0) throw new NotFoundException(nameof(LibraryShare), shareId);
    }

    public async Task UpdateRoleAsync(Guid shareId, UpdateShareRoleRequest data, CancellationToken ct)
    {
        var share = await db.LibraryShares.FirstOrDefaultAsync(s => s.Id == shareId, ct)
            ?? throw new NotFoundException(nameof(LibraryShare), shareId);

        if (Enum.TryParse<ShareRole>(data.Role, true, out var r))
            share.Role = r;

        await db.SaveChangesAsync(ct);
    }
}
