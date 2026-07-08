using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Delivery.Commands;

public record CompleteDeliveryCommand(Guid DeliveryManId, Guid AssignmentId, string Otp) : IRequest<CompleteDeliveryResult>;

public record CompleteDeliveryResult(bool Success, string Message);

public class CompleteDeliveryCommandHandler : IRequestHandler<CompleteDeliveryCommand, CompleteDeliveryResult>
{
    private readonly IApplicationDbContext _context;

    public CompleteDeliveryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CompleteDeliveryResult> Handle(CompleteDeliveryCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.DeliveryVerification)
            .FirstOrDefaultAsync(o => o.Id == request.AssignmentId && o.DeliveryManId == request.DeliveryManId, cancellationToken);

        if (order == null) return new CompleteDeliveryResult(false, "Order not found or not assigned to you.");

        if (order.Status != OrderStatus.OutForDelivery)
            return new CompleteDeliveryResult(false, "Order is not out for delivery.");

        if (order.DeliveryVerification == null || order.DeliveryVerification.OtpCode != request.Otp)
            return new CompleteDeliveryResult(false, "Invalid OTP provided.");
            
        if (order.DeliveryVerification.OtpExpiresAt < DateTime.UtcNow)
            return new CompleteDeliveryResult(false, "OTP has expired.");

        order.Status = OrderStatus.Delivered;
        order.DeliveryVerification.VerifiedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync(cancellationToken);
        
        return new CompleteDeliveryResult(true, "Delivery completed successfully.");
    }
}
