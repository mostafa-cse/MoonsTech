using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using AestheticTechStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Delivery.Commands;

public record PickupDeliveryCommand(Guid DeliveryManId, Guid AssignmentId) : IRequest<PickupDeliveryResult>;

public record PickupDeliveryResult(bool Success, string Message);

public class PickupDeliveryCommandHandler : IRequestHandler<PickupDeliveryCommand, PickupDeliveryResult>
{
    private readonly IApplicationDbContext _context;

    public PickupDeliveryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PickupDeliveryResult> Handle(PickupDeliveryCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.DeliveryVerification)
            .FirstOrDefaultAsync(o => o.Id == request.AssignmentId && o.DeliveryManId == request.DeliveryManId, cancellationToken);

        if (order == null) return new PickupDeliveryResult(false, "Order not found or not assigned to you.");

        if (order.Status != OrderStatus.InTransit)
            return new PickupDeliveryResult(false, "Order must be InTransit before picking up.");

        order.Status = OrderStatus.OutForDelivery;
        
        if (order.DeliveryVerification == null)
        {
            var otp = new Random().Next(1000, 9999).ToString();
            order.DeliveryVerification = new DeliveryVerification
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                OtpCode = otp,
                OtpExpiresAt = DateTime.UtcNow.AddHours(24),
                DeliveryPhotoUrl = "" // Assuming it's required by the entity to not be null
            };
        }
        else
        {
            order.DeliveryVerification.OtpCode = new Random().Next(1000, 9999).ToString();
            order.DeliveryVerification.OtpExpiresAt = DateTime.UtcNow.AddHours(24);
        }
        
        await _context.SaveChangesAsync(cancellationToken);
        
        return new PickupDeliveryResult(true, "Order picked up. OTP generated.");
    }
}
