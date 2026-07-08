using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Common.Models;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Products.Queries;

public record GetProductsQuery(
    string? SearchTerm = null, 
    Guid? CategoryId = null, 
    Guid? BrandId = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    string? SortBy = null,
    int Page = 1,
    int Limit = 24
) : IRequest<PaginatedResult<ProductDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PaginatedResult<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query = query.Where(p => p.Name.ToLower().Contains(request.SearchTerm.ToLower()) || p.Sku.ToLower().Contains(request.SearchTerm.ToLower()));
        }

        if (request.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        if (request.BrandId.HasValue)
        {
            query = query.Where(p => p.BrandId == request.BrandId.Value);
        }

        if (request.MinPrice.HasValue)
        {
            query = query.Where(p => (p.DiscountPrice != null ? p.DiscountPrice : p.RegularPrice) >= request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(p => (p.DiscountPrice != null ? p.DiscountPrice : p.RegularPrice) <= request.MaxPrice.Value);
        }

        // Sorting
        query = request.SortBy switch
        {
            "price_asc" => query.OrderBy(p => p.DiscountPrice != null ? p.DiscountPrice : p.RegularPrice),
            "price_desc" => query.OrderByDescending(p => p.DiscountPrice != null ? p.DiscountPrice : p.RegularPrice),
            "popular" => query.OrderByDescending(p => p.StockQuantity), // Mock for popular
            "discount" => query.Where(p => p.DiscountPrice != null).OrderByDescending(p => p.RegularPrice - p.DiscountPrice),
            _ => query.OrderByDescending(p => p.Id) // "newest" or default
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var products = await query
            .Skip((request.Page - 1) * request.Limit)
            .Take(request.Limit)
            .ToListAsync(cancellationToken);

        var dtos = products.Select(p => new ProductDto(
            p.Id,
            p.Sku,
            p.Slug,
            p.Name,
            p.ImageUrl,
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

        return new PaginatedResult<ProductDto>(dtos, totalCount, request.Page, request.Limit);
    }
}
