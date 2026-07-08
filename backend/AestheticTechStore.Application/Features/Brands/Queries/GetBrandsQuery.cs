using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Brands.Queries;

public record BrandDto(Guid Id, string Name, string LogoUrl, string Description);

public record GetBrandsQuery() : IRequest<List<BrandDto>>;

public class GetBrandsQueryHandler : IRequestHandler<GetBrandsQuery, List<BrandDto>>
{
    private readonly IApplicationDbContext _context;

    public GetBrandsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BrandDto>> Handle(GetBrandsQuery request, CancellationToken cancellationToken)
    {
        var brands = await _context.Brands
            .AsNoTracking()
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);

        return brands.Select(b => new BrandDto(b.Id, b.Name, b.LogoUrl ?? "", b.Description ?? "")).ToList();
    }
}
