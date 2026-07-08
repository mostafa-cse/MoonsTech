using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Products.Queries;

public record GetProductBySlugQuery(string Slug) : IRequest<ProductDto>;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, ProductDto>
{
    private readonly IApplicationDbContext _context;

    public GetProductBySlugQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProductDto> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
    {
        var p = await _context.Products
            .Include(x => x.Category)
            .Include(x => x.Brand)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Slug == request.Slug, cancellationToken);

        if (p == null) return null;

        return new ProductDto(
            p.Id,
            p.Sku,
            p.Slug,
            p.Name,
            p.ShortDescription,
            p.FullDescription,
            p.CategoryId,
            p.Category?.Name ?? "",
            p.BrandId,
            p.Brand?.Name ?? "",
            p.RegularPrice,
            p.DiscountPrice,
            p.StockQuantity,
            p.WarrantyMonths,
            p.MegaCoinReward,
            p.Status.ToString()
        );
    }
}
