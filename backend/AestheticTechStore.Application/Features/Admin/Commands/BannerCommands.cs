using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Admin.Commands;

public class CreateBannerCommand : IRequest<Guid>
{
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Image { get; set; }
    public string Link { get; set; }
    public string Position { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class CreateBannerCommandHandler : IRequestHandler<CreateBannerCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateBannerCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateBannerCommand request, CancellationToken cancellationToken)
    {
        var banner = new Banner
        {
            Title = request.Title ?? string.Empty,
            Subtitle = request.Subtitle ?? string.Empty,
            Image = request.Image ?? string.Empty,
            Link = request.Link ?? string.Empty,
            Position = request.Position ?? string.Empty,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        _context.Banners.Add(banner);
        await _context.SaveChangesAsync(cancellationToken);
        return banner.Id;
    }
}

public class UpdateBannerCommand : IRequest<bool>
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

public class UpdateBannerCommandHandler : IRequestHandler<UpdateBannerCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateBannerCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateBannerCommand request, CancellationToken cancellationToken)
    {
        var banner = await _context.Banners.FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);
        if (banner == null) return false;

        banner.Title = request.Title ?? banner.Title;
        banner.Subtitle = request.Subtitle ?? banner.Subtitle;
        banner.Image = request.Image ?? banner.Image;
        banner.Link = request.Link ?? banner.Link;
        banner.Position = request.Position ?? banner.Position;
        banner.SortOrder = request.SortOrder;
        banner.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public class DeleteBannerCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteBannerCommandHandler : IRequestHandler<DeleteBannerCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteBannerCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteBannerCommand request, CancellationToken cancellationToken)
    {
        var banner = await _context.Banners.FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);
        if (banner == null) return false;

        _context.Banners.Remove(banner);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
