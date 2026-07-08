using System;
using System.Collections.Generic;
using System.Linq;
using AestheticTechStore.Domain.Entities;
using AestheticTechStore.Domain.Specifications.PcBuilderRules;

namespace AestheticTechStore.Application.Features.PcBuilder;

public class PcBuildBuilder
{
    private readonly ICompatibilityEngine _compatibilityEngine;
    private readonly PcBuild _build;
    private readonly List<Product> _selectedProducts;

    public PcBuildBuilder(ICompatibilityEngine compatibilityEngine, Guid userId, string buildName)
    {
        _compatibilityEngine = compatibilityEngine;
        _build = new PcBuild
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = buildName,
            Components = new List<PcBuildComponent>()
        };
        _selectedProducts = new List<Product>();
    }

    public PcBuildBuilder AddComponent(Product product, ComponentSlot slot)
    {
        // 1. Evaluate compatibility against current build
        var result = _compatibilityEngine.Evaluate(_selectedProducts, product);
        
        if (!result.IsCompatible)
        {
            throw new InvalidOperationException($"Cannot add component: {result.ErrorMessage}");
        }

        // 2. Add to build
        _build.Components.Add(new PcBuildComponent
        {
            Id = Guid.NewGuid(),
            PcBuildId = _build.Id,
            ProductId = product.Id,
            Slot = slot,
            Product = product
        });
        
        _selectedProducts.Add(product);
        
        return this;
    }

    public int GetEstimatedWattage()
    {
        return _compatibilityEngine.EstimateWattage(_selectedProducts);
    }

    public PcBuild Build()
    {
        return _build;
    }
}
