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

public record GetAdminOrderByIdQuery(Guid Id) : IRequest<AdminOrderDetailsDto>;

public class AdminOrderDetailsDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; }
    public string Status { get; set; }
    public string PaymentStatus { get; set; }
    public string DeliveryAddress { get; set; }
    public decimal Subtotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal MegaCoinDiscount { get; set; }
    public int MegaCoinsUsed { get; set; }
    public decimal Total { get; set; }
    public List<AdminOrderItemDto> Items { get; set; } = new();
}

public class AdminOrderItemDto
{
    public Guid Id { get; set; }
    public string ProductName { get; set; }
    public string Sku { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}

public class GetAdminOrderByIdQueryHandler : IRequestHandler<GetAdminOrderByIdQuery, AdminOrderDetailsDto>
{
    private readonly IApplicationDbContext _context;

    public GetAdminOrderByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminOrderDetailsDto> Handle(GetAdminOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (order == null) return null;

        var subtotal = order.Items.Sum(i => i.UnitPriceAtPurchase * i.Quantity);
        
        return new AdminOrderDetailsDto
        {
            Id = order.Id,
            OrderNumber = order.Id.ToString().Substring(0, 8).ToUpper(),
            Status = order.Status.ToString(),
            PaymentStatus = "paid", // Placeholder
            DeliveryAddress = order.DeliveryAddress,
            Subtotal = subtotal,
            ShippingCost = 50, // Placeholder
            DiscountAmount = 0, // Placeholder
            MegaCoinDiscount = 0, // Placeholder
            MegaCoinsUsed = 0, // Placeholder
            Total = order.TotalAmount,
            Items = order.Items.Select(i => new AdminOrderItemDto
            {
                Id = i.Id,
                ProductName = i.Product.Name,
                Sku = i.Product.Sku,
                Quantity = i.Quantity,
                TotalPrice = i.UnitPriceAtPurchase * i.Quantity
            }).ToList()
        };
    }
}
