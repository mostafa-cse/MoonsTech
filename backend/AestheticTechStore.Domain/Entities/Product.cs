using System;
using System.Collections.Generic;
using AestheticTechStore.Domain.Enums;

namespace AestheticTechStore.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public string Sku { get; set; }
    public string Slug { get; set; }
    public string Name { get; set; }
    public string ImageUrl { get; set; }
    public string ShortDescription { get; set; }
    public string FullDescription { get; set; }
    public Guid CategoryId { get; set; }
    public Guid BrandId { get; set; }
    
    public decimal RegularPrice { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int StockQuantity { get; set; }
    
    public int WarrantyMonths { get; set; }
    public int MegaCoinReward { get; set; }
    public ProductStatus Status { get; set; }
    
    // Concurrency token to prevent overselling
    public byte[] RowVersion { get; set; } = Guid.NewGuid().ToByteArray();

    public Category Category { get; set; }
    public Brand Brand { get; set; }
    public ICollection<ProductSpecification> Specifications { get; set; } = new List<ProductSpecification>();
}

public class ProductSpecification
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string Key { get; set; }
    public string Value { get; set; }

    public Product Product { get; set; }
}
