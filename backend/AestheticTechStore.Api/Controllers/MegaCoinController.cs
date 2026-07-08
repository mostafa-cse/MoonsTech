using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AestheticTechStore.Application.Features.MegaCoin.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MegaCoinController : ControllerBase
{
    private readonly IMediator _mediator;

    public MegaCoinController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetMegaCoins()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _mediator.Send(new GetMegaCoinBalanceQuery(userId));
        return Ok(result);
    }
}
