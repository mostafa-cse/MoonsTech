namespace AestheticTechStore.Domain.Enums;

public enum OrderStatus
{
    Pending,
    Confirmed,
    Processing,
    ReadyToShip,
    HandoverToDelivery,
    InTransit,
    OutForDelivery,
    Delivered,
    Cancelled,
    Returned
}
