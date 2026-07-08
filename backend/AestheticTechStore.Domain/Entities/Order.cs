using System;
using System.Collections.Generic;
using AestheticTechStore.Domain.Enums;

namespace AestheticTechStore.Domain.Entities;

public class Order
{
    public Guid Id { get; set; }
    public Guid BuyerId { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public Guid? CouponId { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string PaymentReference { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Guid? DeliveryManId { get; set; }
    public string DeliveryAddress { get; set; }

    public User Buyer { get; set; }
    public Coupon Coupon { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public DeliveryVerification DeliveryVerification { get; set; }
}

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceAtPurchase { get; set; }

    public Order Order { get; set; }
    public Product Product { get; set; }
}

public class DeliveryVerification
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string OtpCode { get; set; }
    public DateTime OtpExpiresAt { get; set; }
    public string SignatureImageUrl { get; set; }
    public string DeliveryPhotoUrl { get; set; }
    public DateTime? VerifiedAt { get; set; }

    public Order Order { get; set; }
}
