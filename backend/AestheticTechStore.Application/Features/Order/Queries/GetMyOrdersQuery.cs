using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks;
using AestheticTechStore.Application.Common.Models;
using AestheticTechStore.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Orders.Queries;

public record GetMyOrdersQuery(Guid UserId, int Page = 1, int PageSize = 10) : IRequest<PaginatedList<OrderSummaryDto>>;

public class OrderSummaryDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string PaymentMethod { get; set; }
    public object[] Items { get; set; }
}

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, PaginatedList<OrderSummaryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMyOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<OrderSummaryDto>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Where(o => o.BuyerId == request.UserId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(o => new OrderSummaryDto
            {
                Id = o.Id,
                OrderNumber = o.Id.ToString().Substring(0, 8).ToUpper(),
                Total = o.TotalAmount,
                Status = o.Status.ToString(),
                CreatedAt = o.CreatedAt,
                PaymentMethod = o.PaymentMethod.ToString(),
                Items = new object[o.Items.Count]
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<OrderSummaryDto>(items, totalCount, request.Page, request.PageSize);
    }
}
