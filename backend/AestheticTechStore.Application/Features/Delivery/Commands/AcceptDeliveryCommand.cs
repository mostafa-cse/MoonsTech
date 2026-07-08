using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Delivery.Commands;

public record AcceptDeliveryCommand(Guid DeliveryManId, Guid AssignmentId) : IRequest<AcceptDeliveryResult>;

public record AcceptDeliveryResult(bool Success, string Message);

public class AcceptDeliveryCommandHandler : IRequestHandler<AcceptDeliveryCommand, AcceptDeliveryResult>
{
    private readonly IApplicationDbContext _context;

    public AcceptDeliveryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AcceptDeliveryResult> Handle(AcceptDeliveryCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == request.AssignmentId && o.DeliveryManId == request.DeliveryManId, cancellationToken);

        if (order == null) return new AcceptDeliveryResult(false, "Order not found or not assigned to you.");

        if (order.Status != OrderStatus.HandoverToDelivery)
            return new AcceptDeliveryResult(false, "Order is not in HandoverToDelivery status.");

        order.Status = OrderStatus.InTransit;
        
        await _context.SaveChangesAsync(cancellationToken);
        
        return new AcceptDeliveryResult(true, "Order accepted successfully.");
    }
}
