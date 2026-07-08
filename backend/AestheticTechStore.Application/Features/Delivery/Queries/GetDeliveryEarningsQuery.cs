using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Delivery.Queries;

public record GetDeliveryEarningsQuery(Guid DeliveryManId) : IRequest<DeliveryEarningsDto>;

public class DeliveryEarningsDto
{
    public decimal TotalEarnings { get; set; }
    public int TotalDeliveries { get; set; }
    public decimal TotalCOD { get; set; }
    public List<DeliveryHistoryItem> History { get; set; } = new();
}

public class DeliveryHistoryItem
{
    public Guid Id { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public decimal Commission { get; set; }
}

public class GetDeliveryEarningsQueryHandler : IRequestHandler<GetDeliveryEarningsQuery, DeliveryEarningsDto>
{
    private readonly IApplicationDbContext _context;

    public GetDeliveryEarningsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DeliveryEarningsDto> Handle(GetDeliveryEarningsQuery request, CancellationToken cancellationToken)
    {
        var completedOrders = await _context.Orders
            .Include(o => o.DeliveryVerification)
            .Where(o => o.DeliveryManId == request.DeliveryManId && o.Status == OrderStatus.Delivered)
            .OrderByDescending(o => o.DeliveryVerification.VerifiedAt)
            .ToListAsync(cancellationToken);

        var commissionPerOrder = 5m; // Flat $5 commission for now

        var dto = new DeliveryEarningsDto
        {
            TotalDeliveries = completedOrders.Count,
            TotalEarnings = completedOrders.Count * commissionPerOrder,
            TotalCOD = completedOrders
                .Where(o => o.PaymentMethod == PaymentMethod.CashOnDelivery)
                .Sum(o => o.TotalAmount),
            History = completedOrders.Select(o => new DeliveryHistoryItem
            {
                Id = o.Id,
                DeliveredAt = o.DeliveryVerification?.VerifiedAt,
                Commission = commissionPerOrder
            }).ToList()
        };

        return dto;
    }
}
