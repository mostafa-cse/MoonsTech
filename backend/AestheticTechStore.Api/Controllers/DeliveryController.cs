using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Delivery.Commands;
using AestheticTechStore.Application.Features.Delivery.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "DeliveryMan, Admin")]
public class DeliveryController : ControllerBase
{
    private readonly IMediator _mediator;

    public DeliveryController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var deliveryManId))
        {
            var result = await _mediator.Send(new GetDeliveryDashboardQuery(deliveryManId));
            return Ok(result);
        }
        return Unauthorized();
    }

    [HttpGet("assignments")]
    public async Task<IActionResult> GetAssignments()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var deliveryManId))
        {
            var result = await _mediator.Send(new GetDeliveryAssignmentsQuery(deliveryManId));
            return Ok(result);
        }
        return Unauthorized();
    }

    [HttpPost("accept")]
    public async Task<IActionResult> AcceptDelivery([FromBody] AcceptDeliveryRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var deliveryManId))
        {
            var result = await _mediator.Send(new AcceptDeliveryCommand(deliveryManId, request.AssignmentId));
            if (result.Success) return Ok(result);
            return BadRequest(result);
        }
        return Unauthorized();
    }

    [HttpPost("pickup")]
    public async Task<IActionResult> PickupDelivery([FromBody] PickupDeliveryRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var deliveryManId))
        {
            var result = await _mediator.Send(new PickupDeliveryCommand(deliveryManId, request.AssignmentId));
            if (result.Success) return Ok(result);
            return BadRequest(result);
        }
        return Unauthorized();
    }

    [HttpPost("complete")]
    public async Task<IActionResult> CompleteDelivery([FromBody] CompleteDeliveryRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var deliveryManId))
        {
            var result = await _mediator.Send(new CompleteDeliveryCommand(deliveryManId, request.AssignmentId, request.Otp));
            if (result.Success) return Ok(result);
            return BadRequest(result);
        }
        return Unauthorized();
    }

    [HttpGet("earnings")]
    public async Task<IActionResult> GetEarnings()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var deliveryManId))
        {
            var result = await _mediator.Send(new GetDeliveryEarningsQuery(deliveryManId));
            return Ok(result);
        }
        return Unauthorized();
    }
}

public class AcceptDeliveryRequest { public Guid AssignmentId { get; set; } }
public class PickupDeliveryRequest { public Guid AssignmentId { get; set; } }
public class CompleteDeliveryRequest { public Guid AssignmentId { get; set; } public string Otp { get; set; } }
