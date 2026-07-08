using System;

namespace AestheticTechStore.Domain.Entities;

public enum DiscountType
{
    Percentage,
    FixedAmount
}

public class Coupon
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal Value { get; set; }
    public decimal MinOrderAmount { get; set; }
    public decimal? MaxDiscountCap { get; set; }
    
    public int UsageLimitTotal { get; set; }
    public int UsageLimitPerUser { get; set; }
    
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
}
