using System;
using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? searchTerm, 
        [FromQuery] Guid? categoryId, 
        [FromQuery] Guid? brandId, 
        [FromQuery] decimal? minPrice, 
        [FromQuery] decimal? maxPrice, 
        [FromQuery] string? sortBy, 
        [FromQuery] int page = 1, 
        [FromQuery] int limit = 24)
    {
        var result = await _mediator.Send(new GetProductsQuery(searchTerm, categoryId, brandId, minPrice, maxPrice, sortBy, page, limit));
        return Ok(result);
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetAdminProducts([FromQuery] int limit = 50)
    {
        var result = await _mediator.Send(new GetProductsQuery(null, null, null, null, null, null, 1, limit));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProductById(Guid id)
    {
        var result = await _mediator.Send(new GetProductByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetProductBySlug(string slug)
    {
        var result = await _mediator.Send(new GetProductBySlugQuery(slug));
        if (result == null) return NotFound();
        return Ok(result);
    }
}
