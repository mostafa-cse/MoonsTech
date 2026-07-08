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

public class GetSalesAnalyticsQuery : IRequest<SalesAnalyticsDto>
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class SalesAnalyticsDto
{
    public List<AdminOrderDto> Orders { get; set; } = new();
    public List<DailyRevenueDto> DailyRevenue { get; set; } = new();
}

public class DailyRevenueDto
{
    public string Date { get; set; }
    public decimal Revenue { get; set; }
}

public class GetSalesAnalyticsQueryHandler : IRequestHandler<GetSalesAnalyticsQuery, SalesAnalyticsDto>
{
    private readonly IApplicationDbContext _context;

    public GetSalesAnalyticsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SalesAnalyticsDto> Handle(GetSalesAnalyticsQuery request, CancellationToken cancellationToken)
    {
        // Adjust end date to include the full day
        var endDate = request.EndDate.Date.AddDays(1).AddTicks(-1);
        
        var orders = await _context.Orders
            .Where(o => o.CreatedAt >= request.StartDate.Date && o.CreatedAt <= endDate)
            .OrderBy(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        var orderDtos = orders.Select(o => new AdminOrderDto
        {
            Id = o.Id,
            OrderNumber = o.Id.ToString().Substring(0, 8).ToUpper(),
            Total = o.TotalAmount,
            CreatedAt = o.CreatedAt,
            Status = o.Status.ToString(),
            PaymentMethod = o.PaymentMethod.ToString(),
            PaymentStatus = "paid"
        }).ToList();

        // Calculate daily revenue
        var dailyRevenue = orders
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new DailyRevenueDto
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .ToList();

        // Fill in missing days
        var allDays = new List<DailyRevenueDto>();
        for (var date = request.StartDate.Date; date <= request.EndDate.Date; date = date.AddDays(1))
        {
            var rev = dailyRevenue.FirstOrDefault(d => d.Date == date.ToString("yyyy-MM-dd"));
            allDays.Add(new DailyRevenueDto
            {
                Date = date.ToString("yyyy-MM-dd"),
                Revenue = rev?.Revenue ?? 0
            });
        }

        return new SalesAnalyticsDto
        {
            Orders = orderDtos,
            DailyRevenue = allDays
        };
    }
}
