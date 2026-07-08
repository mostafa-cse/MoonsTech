using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Brands.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandController : ControllerBase
{
    private readonly IMediator _mediator;

    public BrandController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetBrands()
    {
        var result = await _mediator.Send(new GetBrandsQuery());
        return Ok(result);
    }
}
