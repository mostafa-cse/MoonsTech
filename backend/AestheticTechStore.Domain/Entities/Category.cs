using System;
using System.Collections.Generic;
using AestheticTechStore.Domain.Enums;

namespace AestheticTechStore.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string ImageUrl { get; set; }
    public Guid? ParentCategoryId { get; set; }

    public Category ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; }
    public ICollection<Product> Products { get; set; }
}

public class Brand
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string LogoUrl { get; set; }
    public string Description { get; set; }

    public ICollection<Product> Products { get; set; }
}
