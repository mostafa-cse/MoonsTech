using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Address.Commands;
using AestheticTechStore.Application.Features.Address.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddressController : ControllerBase
{
    private readonly IMediator _mediator;

    public AddressController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAddresses()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _mediator.Send(new GetAddressesQuery(userId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> AddAddress([FromBody] AddAddressCommand command)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var commandWithUser = command with { UserId = userId };
        var result = await _mediator.Send(commandWithUser);
        return Ok(result);
    }
}
