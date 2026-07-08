using System;
using System.Linq;
using System.Threading.Tasks;
using AestheticTechStore.Domain.Entities;
using AestheticTechStore.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AestheticTechStore.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        await context.Database.MigrateAsync();

        // Seed Roles
        var roles = new[] { "Admin", "Buyer", "DeliveryMan" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }

        // Seed Admin User
        if (await userManager.FindByEmailAsync("admin@admin.com") == null)
        {
            var adminUser = new User
            {
                UserName = "admin@admin.com",
                Email = "admin@admin.com"
            };
            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Seed PC Components
        if (!context.Products.Any())
        {
            var brand = new Brand { Name = "Generic Brand", Description = "Generic", LogoUrl = "url" };
            context.Brands.Add(brand);
            await context.SaveChangesAsync();

            var category = new Category { Name = "PC Components", Description = "Computer Parts", ImageUrl = "url" };
            context.Categories.Add(category);
            await context.SaveChangesAsync();

            var products = new[]
            {
                new Product
                {
                    Name = "Intel Core i7-13700K",
                    Sku = "intel-core-i7-13700k",
                    Slug = "intel-core-i7-13700k",
                    ShortDescription = "CPU",
                    FullDescription = "Intel CPU",
                    CategoryId = category.Id,
                    BrandId = brand.Id,
                    RegularPrice = 400,
                    DiscountPrice = 380,
                    Status = ProductStatus.Published,
                    StockQuantity = 10,
                    RowVersion = new byte[] { 0, 0, 0, 0, 0, 0, 0, 1 }
                },
                new Product
                {
                    Name = "ASUS ROG Strix Z790-E Gaming WiFi",
                    Sku = "asus-rog-strix-z790-e",
                    Slug = "asus-rog-strix-z790-e",
                    ShortDescription = "Motherboard",
                    FullDescription = "ASUS Motherboard",
                    CategoryId = category.Id,
                    BrandId = brand.Id,
                    RegularPrice = 499,
                    Status = ProductStatus.Published,
                    StockQuantity = 5,
                    RowVersion = new byte[] { 0, 0, 0, 0, 0, 0, 0, 1 }
                },
                new Product
                {
                    Name = "NVIDIA GeForce RTX 4090",
                    Sku = "nvidia-geforce-rtx-4090",
                    Slug = "nvidia-geforce-rtx-4090",
                    ShortDescription = "GPU",
                    FullDescription = "NVIDIA GPU",
                    CategoryId = category.Id,
                    BrandId = brand.Id,
                    RegularPrice = 1599,
                    Status = ProductStatus.Published,
                    StockQuantity = 2,
                    RowVersion = new byte[] { 0, 0, 0, 0, 0, 0, 0, 1 }
                }
            };
            
            context.Products.AddRange(products);
            await context.SaveChangesAsync();

            // Add basic specs for PC Builder rules
            context.ProductSpecifications.AddRange(
                new ProductSpecification { ProductId = products[0].Id, Key = "ComponentType", Value = "cpu" },
                new ProductSpecification { ProductId = products[0].Id, Key = "Socket", Value = "LGA1700" },
                
                new ProductSpecification { ProductId = products[1].Id, Key = "ComponentType", Value = "motherboard" },
                new ProductSpecification { ProductId = products[1].Id, Key = "Socket", Value = "LGA1700" },
                
                new ProductSpecification { ProductId = products[2].Id, Key = "ComponentType", Value = "gpu" }
            );
            await context.SaveChangesAsync();
        }
    }
}
