using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Admin.Commands;

public class UpdateAdminOrderStatusCommand : IRequest<bool>
{
    public Guid OrderId { get; set; }
    public string Status { get; set; }
    public string PaymentStatus { get; set; }
}

public class UpdateAdminOrderStatusCommandHandler : IRequestHandler<UpdateAdminOrderStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateAdminOrderStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateAdminOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);
        if (order == null) return false;

        if (!string.IsNullOrEmpty(request.Status))
        {
            if (Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
            {
                order.Status = newStatus;
            }
        }

        // payment status is not a real column on Order yet, so we ignore it for now
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
