using System;
using AestheticTechStore.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace AestheticTechStore.Domain.Entities;

public class User : IdentityUser<Guid>
{
    public Role Role { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public UserProfile Profile { get; set; }
}

public class UserProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? Avatar { get; set; }
    public string? Division { get; set; }
    public string? District { get; set; }
    public string? Thana { get; set; }
    public string? Address { get; set; }
    
    // For DeliveryMan
    public string? EmergencyContact { get; set; }

    // Navigation property
    public User User { get; set; }
}
