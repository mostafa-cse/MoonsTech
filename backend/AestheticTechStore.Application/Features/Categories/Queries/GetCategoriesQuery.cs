using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Categories.Queries;

public record CategoryDto(Guid Id, string Name, string ImageUrl, string Description);

public record GetCategoriesQuery() : IRequest<List<CategoryDto>>;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCategoriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(c => new CategoryDto(c.Id, c.Name, c.ImageUrl ?? "", c.Description ?? "")).ToList();
    }
}
