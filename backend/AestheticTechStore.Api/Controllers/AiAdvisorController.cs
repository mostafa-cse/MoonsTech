using System.Threading.Tasks;
using AestheticTechStore.Application.Features.AiAdvisor.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiAdvisorController : ControllerBase
{
    private readonly IMediator _mediator;

    public AiAdvisorController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("recommend")]
    public async Task<IActionResult> Recommend([FromBody] AiAdvisorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest("Prompt cannot be empty.");
        }

        var result = await _mediator.Send(new GetPcBuildRecommendationQuery(request.Prompt));
        
        return Ok(new { Recommendation = result });
    }
}

public class AiAdvisorRequest
{
    public string Prompt { get; set; } = string.Empty;
}
