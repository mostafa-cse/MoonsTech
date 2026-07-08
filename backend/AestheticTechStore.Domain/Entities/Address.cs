using System;

namespace AestheticTechStore.Domain.Entities;

public class Address
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; }
    public string Phone { get; set; }
    public string Division { get; set; }
    public string District { get; set; }
    public string Thana { get; set; }
    public string FullAddress { get; set; }
    public bool IsDefault { get; set; }

    public User User { get; set; }
}
