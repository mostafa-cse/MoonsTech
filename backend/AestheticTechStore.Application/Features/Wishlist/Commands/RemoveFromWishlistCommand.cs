using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Wishlist.Commands;

public record RemoveFromWishlistCommand(Guid UserId, Guid ProductId) : IRequest<bool>;

public class RemoveFromWishlistCommandHandler : IRequestHandler<RemoveFromWishlistCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public RemoveFromWishlistCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(RemoveFromWishlistCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.Wishlists
            .FirstOrDefaultAsync(w => w.UserId == request.UserId && w.ProductId == request.ProductId, cancellationToken);
            
        if (item != null)
        {
            _context.Wishlists.Remove(item);
            await _context.SaveChangesAsync(cancellationToken);
        }
        return true;
    }
}
