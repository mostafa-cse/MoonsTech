using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Categories.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoryController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var result = await _mediator.Send(new GetCategoriesQuery());
        return Ok(result);
    }
}
