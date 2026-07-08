using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Wishlist.Commands;
using AestheticTechStore.Application.Features.Wishlist.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IMediator _mediator;

    public WishlistController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _mediator.Send(new GetWishlistQuery(userId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> AddToWishlist([FromBody] AddToWishlistCommand command)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var commandWithUser = command with { UserId = userId };
        var result = await _mediator.Send(commandWithUser);
        return Ok(result);
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromWishlist(Guid productId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _mediator.Send(new RemoveFromWishlistCommand(userId, productId));
        return Ok(result);
    }
}
