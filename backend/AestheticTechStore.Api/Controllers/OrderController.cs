using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Checkout.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrderController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutCommand command)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var userId))
        {
            var commandWithUserId = command with { UserId = userId };
            var result = await _mediator.Send(commandWithUserId);
            
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }
        return Unauthorized();
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _mediator.Send(new AestheticTechStore.Application.Features.Orders.Queries.GetMyOrdersQuery(userId));
        return Ok(result);
    }

    [HttpPost("track")]
    [AllowAnonymous] // Anyone can track if they have order number and phone
    public async Task<IActionResult> TrackOrder([FromBody] AestheticTechStore.Application.Features.Orders.Queries.TrackOrderQuery query)
    {
        var result = await _mediator.Send(query);
        if (result.Success)
            return Ok(result.OrderDetails);
        return BadRequest(new { message = result.Message });
    }
}
