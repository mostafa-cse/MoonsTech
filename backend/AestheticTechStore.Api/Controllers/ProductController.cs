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
    public async Task<IActionResult> GetProducts([FromQuery] string? searchTerm, [FromQuery] Guid? categoryId, [FromQuery] Guid? brandId, [FromQuery] bool? featured, [FromQuery] bool? bestSeller, [FromQuery] bool? newArrival)
    {
        var result = await _mediator.Send(new GetProductsQuery(searchTerm, categoryId, brandId));
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
