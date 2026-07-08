using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Wishlist.Queries;

public record GetWishlistQuery(Guid UserId) : IRequest<List<WishlistItemDto>>;

public class WishlistItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string ImageUrl { get; set; }
    public bool InStock { get; set; }
}

public class GetWishlistQueryHandler : IRequestHandler<GetWishlistQuery, List<WishlistItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWishlistQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WishlistItemDto>> Handle(GetWishlistQuery request, CancellationToken cancellationToken)
    {
        return await _context.Wishlists
            .Include(w => w.Product)
            .Where(w => w.UserId == request.UserId)
            .Select(w => new WishlistItemDto
            {
                Id = w.Id,
                ProductId = w.ProductId,
                Name = w.Product.Name,
                Price = w.Product.RegularPrice,
                DiscountPrice = w.Product.DiscountPrice,
                ImageUrl = "",
                InStock = w.Product.StockQuantity > 0
            })
            .ToListAsync(cancellationToken);
    }
}
