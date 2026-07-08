using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using AestheticTechStore.Application.Interfaces;

namespace AestheticTechStore.Application.Features.Admin.Queries;

public record GetAdminDashboardQuery() : IRequest<AdminDashboardDto>;

public class AdminDashboardDto
{
    public AdminDashboardStatsDto Stats { get; set; } = new();
    public List<TopProductDto> TopProducts { get; set; } = new();
    public List<LowStockProductDto> LowStock { get; set; } = new();
    public List<RecentOrderDto> RecentOrders { get; set; } = new();
}

public class AdminDashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class TopProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int TotalSales { get; set; }
}

public class LowStockProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int StockQuantity { get; set; }
}

public class RecentOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; }
    public string Status { get; set; }
    public string PaymentMethod { get; set; }
    public decimal Total { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GetAdminDashboardQueryHandler : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetAdminDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardDto> Handle(GetAdminDashboardQuery request, CancellationToken cancellationToken)
    {
        var totalUsers = await _context.UserProfiles.CountAsync(cancellationToken);
        var totalProducts = await _context.Products.CountAsync(cancellationToken);
        var totalOrders = await _context.Orders.CountAsync(cancellationToken);
        var totalRevenue = (decimal)await _context.Orders.SumAsync(o => (double)o.TotalAmount, cancellationToken);

        var topProducts = await _context.OrderItems
            .GroupBy(oi => new { oi.ProductId, oi.Product.Name })
            .Select(g => new TopProductDto
            {
                Id = g.Key.ProductId,
                Name = g.Key.Name,
                TotalSales = g.Sum(oi => oi.Quantity)
            })
            .OrderByDescending(x => x.TotalSales)
            .Take(5)
            .ToListAsync(cancellationToken);

        var lowStock = await _context.Products
            .Where(p => p.StockQuantity < 10)
            .OrderBy(p => p.StockQuantity)
            .Take(5)
            .Select(p => new LowStockProductDto
            {
                Id = p.Id,
                Name = p.Name,
                StockQuantity = p.StockQuantity
            })
            .ToListAsync(cancellationToken);

        var recentOrders = await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                OrderNumber = o.Id.ToString().Substring(0, 8).ToUpper(),
                Status = o.Status.ToString(),
                PaymentMethod = o.PaymentMethod.ToString(),
                Total = o.TotalAmount,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new AdminDashboardDto
        {
            Stats = new AdminDashboardStatsDto
            {
                TotalUsers = totalUsers,
                TotalProducts = totalProducts,
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue
            },
            TopProducts = topProducts,
            LowStock = lowStock,
            RecentOrders = recentOrders
        };
    }
}
