using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.MegaCoin.Queries;

public record GetMegaCoinBalanceQuery(Guid UserId) : IRequest<MegaCoinDto>;

public class MegaCoinDto
{
    public int Balance { get; set; }
    public List<MegaCoinHistoryDto> History { get; set; } = new();
}

public class MegaCoinHistoryDto
{
    public Guid Id { get; set; }
    public int Delta { get; set; }
    public string Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GetMegaCoinBalanceQueryHandler : IRequestHandler<GetMegaCoinBalanceQuery, MegaCoinDto>
{
    private readonly IApplicationDbContext _context;

    public GetMegaCoinBalanceQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<MegaCoinDto> Handle(GetMegaCoinBalanceQuery request, CancellationToken cancellationToken)
    {
        var ledgers = await _context.MegaCoinLedgers
            .Where(l => l.UserId == request.UserId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);

        var balance = ledgers.Sum(l => l.Delta);

        return new MegaCoinDto
        {
            Balance = balance,
            History = ledgers.Select(l => new MegaCoinHistoryDto
            {
                Id = l.Id,
                Delta = l.Delta,
                Reason = l.Reason.ToString(),
                CreatedAt = l.CreatedAt
            }).ToList()
        };
    }
}
