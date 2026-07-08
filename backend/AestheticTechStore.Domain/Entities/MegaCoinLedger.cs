using System;
using AestheticTechStore.Domain.Enums;

namespace AestheticTechStore.Domain.Entities;

public class MegaCoinLedger
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    
    // Signed integer: positive for earn, negative for redeem
    public int Delta { get; set; } 
    public MegaCoinTransactionReason Reason { get; set; }
    public Guid? OrderId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; }
    public Order Order { get; set; }
}
