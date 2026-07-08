using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Delivery.Queries;

public record GetDeliveryDashboardQuery(Guid DeliveryManId) : IRequest<DeliveryDashboardDto>;

public record DeliveryDashboardDto(int Assigned, int InProgress, int Completed);

public class GetDeliveryDashboardQueryHandler : IRequestHandler<GetDeliveryDashboardQuery, DeliveryDashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetDeliveryDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DeliveryDashboardDto> Handle(GetDeliveryDashboardQuery request, CancellationToken cancellationToken)
    {
        var assigned = await _context.Orders
            .CountAsync(o => o.DeliveryManId == request.DeliveryManId && o.Status == OrderStatus.HandoverToDelivery, cancellationToken);
            
        var inProgress = await _context.Orders
            .CountAsync(o => o.DeliveryManId == request.DeliveryManId && 
                            (o.Status == OrderStatus.InTransit || o.Status == OrderStatus.OutForDelivery), cancellationToken);
            
        var completed = await _context.Orders
            .CountAsync(o => o.DeliveryManId == request.DeliveryManId && o.Status == OrderStatus.Delivered, cancellationToken);

        return new DeliveryDashboardDto(assigned, inProgress, completed);
    }
}
