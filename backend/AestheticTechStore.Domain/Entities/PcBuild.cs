using System;
using System.Collections.Generic;

namespace AestheticTechStore.Domain.Entities;

public enum ComponentSlot
{
    CPU,
    Cooler,
    Motherboard,
    RAM,
    GPU,
    Storage,
    PowerSupply,
    Casing,
    Monitor,
    Accessories
}

public class PcBuild
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; }
    public bool IsShared { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; }
    public ICollection<PcBuildComponent> Components { get; set; } = new List<PcBuildComponent>();
}

public class PcBuildComponent
{
    public Guid Id { get; set; }
    public Guid PcBuildId { get; set; }
    public Guid ProductId { get; set; }
    public ComponentSlot Slot { get; set; }

    public PcBuild PcBuild { get; set; }
    public Product Product { get; set; }
}
