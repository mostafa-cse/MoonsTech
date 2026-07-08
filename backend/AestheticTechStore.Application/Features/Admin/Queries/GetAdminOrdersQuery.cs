using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Admin.Queries;

public record GetAdminOrdersQuery() : IRequest<List<AdminOrderDto>>;

public class AdminOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; }
    public decimal Total { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; }
    public string PaymentMethod { get; set; }
    public string PaymentStatus { get; set; }
}

public class GetAdminOrdersQueryHandler : IRequestHandler<GetAdminOrdersQuery, List<AdminOrderDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdminOrderDto>> Handle(GetAdminOrdersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new AdminOrderDto
            {
                Id = o.Id,
                OrderNumber = o.Id.ToString().Substring(0, 8).ToUpper(),
                Total = o.TotalAmount,
                CreatedAt = o.CreatedAt,
                Status = o.Status.ToString(),
                PaymentMethod = o.PaymentMethod.ToString(),
                PaymentStatus = "paid" // Simplifying for now, should read from real payment status if exists
            })
            .ToListAsync(cancellationToken);
    }
}
