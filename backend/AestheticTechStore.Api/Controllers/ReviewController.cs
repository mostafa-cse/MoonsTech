using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Review.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReviewController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReviewController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] AddReviewCommand command)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var commandWithUser = command with { UserId = userId };
        var result = await _mediator.Send(commandWithUser);
        return Ok(result);
    }
}
