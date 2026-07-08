using System;

namespace AestheticTechStore.Application.Features.Products.Queries;

public record ProductDto(
    Guid Id,
    string Sku,
    string Slug,
    string Name,
    string ImageUrl,
    string ShortDescription,
    string FullDescription,
    Guid CategoryId,
    string CategoryName,
    Guid BrandId,
    string BrandName,
    decimal RegularPrice,
    decimal? DiscountPrice,
    int StockQuantity,
    int WarrantyMonths,
    int MegaCoinReward,
    string Status
);
