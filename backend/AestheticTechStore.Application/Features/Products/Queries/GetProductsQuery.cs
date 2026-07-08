using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Products.Queries;

public record GetProductsQuery(string? SearchTerm = null, Guid? CategoryId = null, Guid? BrandId = null) : IRequest<List<ProductDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, List<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query = query.Where(p => p.Name.Contains(request.SearchTerm) || p.Sku.Contains(request.SearchTerm));
        }

        if (request.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        if (request.BrandId.HasValue)
        {
            query = query.Where(p => p.BrandId == request.BrandId.Value);
        }

        var products = await query.ToListAsync(cancellationToken);

        return products.Select(p => new ProductDto(
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
        )).ToList();
    }
}
