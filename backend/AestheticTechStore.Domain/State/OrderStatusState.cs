using System;
using AestheticTechStore.Domain.Entities;
using AestheticTechStore.Domain.Enums;

namespace AestheticTechStore.Domain.State;

// State Pattern for Order Status Pipeline
public abstract class OrderStatusState
{
    protected readonly Order _order;

    protected OrderStatusState(Order order)
    {
        _order = order;
    }

    public virtual void MarkConfirmed() => throw new InvalidOperationException($"Cannot transition to Confirmed from {_order.Status}");
    public virtual void MarkProcessing() => throw new InvalidOperationException($"Cannot transition to Processing from {_order.Status}");
    public virtual void MarkReadyToShip() => throw new InvalidOperationException($"Cannot transition to ReadyToShip from {_order.Status}");
    public virtual void MarkHandoverToDelivery() => throw new InvalidOperationException($"Cannot transition to HandoverToDelivery from {_order.Status}");
    public virtual void MarkDelivered(string otp, DeliveryVerification verification) => throw new InvalidOperationException($"Cannot transition to Delivered from {_order.Status}");
    public virtual void Cancel() => throw new InvalidOperationException($"Cannot cancel order in state {_order.Status}");
}

public class PendingState : OrderStatusState
{
    public PendingState(Order order) : base(order) { }

    public override void MarkConfirmed()
    {
        _order.Status = OrderStatus.Confirmed;
    }

    public override void Cancel()
    {
        _order.Status = OrderStatus.Cancelled;
    }
}

public class InTransitState : OrderStatusState
{
    public InTransitState(Order order) : base(order) { }

    public override void MarkDelivered(string otp, DeliveryVerification verification)
    {
        if (verification.OtpCode != otp)
        {
            throw new InvalidOperationException("Invalid OTP provided for delivery handover.");
        }

        if (verification.OtpExpiresAt < DateTime.UtcNow)
        {
            throw new InvalidOperationException("OTP has expired.");
        }

        verification.VerifiedAt = DateTime.UtcNow;
        _order.Status = OrderStatus.Delivered;
    }
}

// Extension to map enum to state class dynamically
public static class OrderStateExtensions
{
    public static OrderStatusState GetState(this Order order)
    {
        return order.Status switch
        {
            OrderStatus.Pending => new PendingState(order),
            OrderStatus.InTransit => new InTransitState(order),
            // ... map other states ...
            _ => throw new NotImplementedException()
        };
    }
}
