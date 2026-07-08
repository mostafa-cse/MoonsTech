using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Wishlist.Commands;

public record AddToWishlistCommand(Guid UserId, Guid ProductId) : IRequest<bool>;

public class AddToWishlistCommandHandler : IRequestHandler<AddToWishlistCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AddToWishlistCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(AddToWishlistCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Wishlists
            .AnyAsync(w => w.UserId == request.UserId && w.ProductId == request.ProductId, cancellationToken);
            
        if (!exists)
        {
            _context.Wishlists.Add(new Domain.Entities.Wishlist
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                ProductId = request.ProductId
            });
            await _context.SaveChangesAsync(cancellationToken);
        }
        return true;
    }
}
