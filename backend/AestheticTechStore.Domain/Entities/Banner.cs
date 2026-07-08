using System;

namespace AestheticTechStore.Domain.Entities;

public class Banner : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
