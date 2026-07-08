using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Admin.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardDto>> GetDashboard()
    {
        var result = await _mediator.Send(new GetAdminDashboardQuery());
        return Ok(result);
    }

    [HttpGet("orders")]
    public async Task<ActionResult> GetOrders()
    {
        var result = await _mediator.Send(new GetAdminOrdersQuery());
        return Ok(result);
    }

    [HttpGet("orders/{id}")]
    public async Task<ActionResult> GetOrderById(Guid id)
    {
        var result = await _mediator.Send(new GetAdminOrderByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("orders/{id}")]
    public async Task<ActionResult> UpdateOrderStatus(Guid id, [FromBody] AestheticTechStore.Application.Features.Admin.Commands.UpdateAdminOrderStatusCommand command)
    {
        if (id != command.OrderId) return BadRequest();
        var result = await _mediator.Send(command);
        if (!result) return NotFound();
        return Ok();
    }

    [HttpGet("users")]
    public async Task<ActionResult> GetUsers()
    {
        var result = await _mediator.Send(new GetAdminUsersQuery());
        return Ok(result);
    }

    [HttpPut("users/{id}/status")]
    public async Task<ActionResult> UpdateUserStatus(Guid id, [FromBody] AestheticTechStore.Application.Features.Admin.Commands.UpdateAdminUserStatusCommand command)
    {
        command.UserId = id;
        var result = await _mediator.Send(command);
        if (!result) return NotFound();
        return Ok();
    }

    [HttpPut("users/{id}/role")]
    public async Task<ActionResult> UpdateUserRole(Guid id, [FromBody] AestheticTechStore.Application.Features.Admin.Commands.UpdateAdminUserRoleCommand command)
    {
        command.UserId = id;
        var result = await _mediator.Send(command);
        if (!result) return NotFound();
        return Ok();
    }

    [HttpPost("sales-report")]
    public async Task<ActionResult> GetSalesReport([FromBody] AestheticTechStore.Application.Features.Admin.Queries.GetSalesAnalyticsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
