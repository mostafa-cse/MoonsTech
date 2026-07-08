using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Orders.Queries;

public record TrackOrderQuery(string OrderNumber, string Phone) : IRequest<TrackOrderResult>;

public class TrackOrderResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public object OrderDetails { get; set; }
}

public class TrackOrderQueryHandler : IRequestHandler<TrackOrderQuery, TrackOrderResult>
{
    private readonly IApplicationDbContext _context;

    public TrackOrderQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TrackOrderResult> Handle(TrackOrderQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id.ToString() == request.OrderNumber || o.Id.ToString().StartsWith(request.OrderNumber.ToLower()), cancellationToken);
            
        if (order == null)
        {
            return new TrackOrderResult { Success = false, Message = "Order not found." };
        }
        
        return new TrackOrderResult
        {
            Success = true,
            OrderDetails = new
            {
                Id = order.Id,
                OrderNumber = order.Id.ToString().Substring(0, 8).ToUpper(),
                Status = order.Status.ToString(),
                Total = order.TotalAmount,
                CreatedAt = order.CreatedAt,
                StatusHistory = new[]
                {
                    new { status = order.Status.ToString(), createdAt = order.CreatedAt, notes = "Order placed successfully." }
                },
                Items = order.Items.Select(i => new
                {
                    id = i.Id,
                    productName = i.Product?.Name ?? "Product",
                    productImage = "",
                    quantity = i.Quantity,
                    totalPrice = i.UnitPriceAtPurchase * i.Quantity
                }).ToArray()
            }
        };
    }
}
