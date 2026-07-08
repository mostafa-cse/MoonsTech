using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Admin.Queries;

public record GetAdminBannersQuery() : IRequest<List<AdminBannerDto>>;

public class AdminBannerDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Image { get; set; }
    public string Link { get; set; }
    public string Position { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class GetAdminBannersQueryHandler : IRequestHandler<GetAdminBannersQuery, List<AdminBannerDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminBannersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdminBannerDto>> Handle(GetAdminBannersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Banners
            .OrderBy(b => b.SortOrder)
            .Select(b => new AdminBannerDto
            {
                Id = b.Id,
                Title = b.Title,
                Subtitle = b.Subtitle,
                Image = b.Image,
                Link = b.Link,
                Position = b.Position,
                SortOrder = b.SortOrder,
                IsActive = b.IsActive
            })
            .ToListAsync(cancellationToken);
    }
}
