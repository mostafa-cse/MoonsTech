using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AestheticTechStore.Application.Features.PcBuilder;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PcBuilderController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICompatibilityEngine _compatibilityEngine;

    public PcBuilderController(IApplicationDbContext context, ICompatibilityEngine compatibilityEngine)
    {
        _context = context;
        _compatibilityEngine = compatibilityEngine;
    }

    [HttpPost("components")]
    public async Task<IActionResult> GetComponents([FromBody] GetComponentsRequest request)
    {
        // simplistic mapping from frontend 'type' string to a CategoryName 
        // e.g. "cpu" -> "Processor", "motherboard" -> "Motherboard"
        var categoryMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            {"cpu", "Processor"},
            {"motherboard", "Motherboard"},
            {"ram", "RAM"},
            {"gpu", "Graphics Card"},
            {"storage", "Storage"},
            {"psu", "Power Supply"},
            {"casing", "PC Case"},
            {"cpu_cooler", "CPU Cooler"},
            {"monitor", "Monitor"}
        };

        var categoryName = categoryMap.GetValueOrDefault(request.Type, request.Type);

        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Specifications)
            .Where(p => p.Category.Name == categoryName)
            .AsNoTracking();

        var availableProducts = await query.ToListAsync();

        if (request.SelectedComponentIds != null && request.SelectedComponentIds.Any())
        {
            var currentBuild = await _context.Products
                .Include(p => p.Specifications)
                .Where(p => request.SelectedComponentIds.Contains(p.Id))
                .ToListAsync();

            // Filter out incompatible components
            var compatibleProducts = availableProducts
                .Where(p => _compatibilityEngine.Evaluate(currentBuild, p).IsCompatible)
                .ToList();
                
            return Ok(compatibleProducts);
        }

        return Ok(availableProducts);
    }

    [HttpPost("save")]
    public IActionResult SaveBuild()
    {
        // Mock save endpoint for now
        return Ok(new { Message = "Build saved successfully!" });
    }
}

public class GetComponentsRequest
{
    public string Type { get; set; } = string.Empty;
    public List<Guid> SelectedComponentIds { get; set; } = new();
}
