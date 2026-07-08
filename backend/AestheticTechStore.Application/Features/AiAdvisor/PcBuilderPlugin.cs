using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using AestheticTechStore.Application.Features.PcBuilder;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;

namespace AestheticTechStore.Application.Features.AiAdvisor;

public class PcBuilderPlugin
{
    private readonly IServiceProvider _serviceProvider;

    public PcBuilderPlugin(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [KernelFunction, Description("Searches the product catalog for a specific component category (e.g., 'CPU', 'Motherboard', 'GPU') that fits within a maximum price.")]
    public async Task<string> SearchProductsAsync(
        [Description("The category of the component to search for (e.g., 'CPU', 'Motherboard', 'GPU', 'RAM').")] string category,
        [Description("The maximum price the user is willing to pay for this component.")] decimal maxPrice)
    {
        // Use a new scope to safely resolve DbContext
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var products = await context.Products
            .Include(p => p.Category)
            .Include(p => p.Specifications)
            .Where(p => p.Category.Name.ToLower().Contains(category.ToLower()))
            .Where(p => (p.DiscountPrice ?? p.RegularPrice) <= maxPrice)
            .Where(p => p.StockQuantity > 0)
            .OrderByDescending(p => p.DiscountPrice ?? p.RegularPrice)
            .Take(5)
            .ToListAsync();

        if (!products.Any())
        {
            return $"No products found in category '{category}' under ${maxPrice}.";
        }

        var result = products.Select(p => 
            $"ID: {p.Id} | Name: {p.Name} | Price: ${(p.DiscountPrice ?? p.RegularPrice)} | Specs: {string.Join(", ", p.Specifications.Select(s => s.Key + "=" + s.Value))}"
        );

        return string.Join("\n", result);
    }

    [KernelFunction, Description("Validates if a list of product IDs are compatible together for a PC build.")]
    public async Task<string> ValidateBuildCompatibilityAsync(
        [Description("A comma-separated list of product IDs representing the components to check.")] string productIdsCsv)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var engine = scope.ServiceProvider.GetRequiredService<ICompatibilityEngine>();

        var ids = productIdsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries)
                               .Select(id => Guid.Parse(id.Trim()))
                               .ToList();

        var products = await context.Products
            .Include(p => p.Category)
            .Include(p => p.Specifications)
            .Where(p => ids.Contains(p.Id))
            .ToListAsync();

        if (products.Count < 2) return "Not enough components to test compatibility.";

        var currentBuild = new List<Product>();
        foreach (var product in products)
        {
            if (currentBuild.Any())
            {
                var result = engine.Evaluate(currentBuild, product);
                if (!result.IsCompatible)
                {
                    return $"INCOMPATIBLE: {result.ErrorMessage} (when adding {product.Name})";
                }
            }
            currentBuild.Add(product);
        }

        var estimatedWattage = engine.EstimateWattage(currentBuild);
        return $"COMPATIBLE. Total estimated wattage: {estimatedWattage}W.";
    }
}
