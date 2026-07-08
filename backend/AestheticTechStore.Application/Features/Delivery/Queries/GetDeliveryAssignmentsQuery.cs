using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Delivery.Queries;

public record GetDeliveryAssignmentsQuery(Guid DeliveryManId) : IRequest<List<DeliveryAssignmentDto>>;

public class DeliveryAssignmentDto
{
    public Guid Id { get; set; }
    public string Status { get; set; }
    public string Otp { get; set; }
    public DateTime AssignedAt { get; set; }
    public OrderDto Order { get; set; }
    
    public class OrderDto
    {
        public string DeliveryAddress { get; set; }
    }
}

public class GetDeliveryAssignmentsQueryHandler : IRequestHandler<GetDeliveryAssignmentsQuery, List<DeliveryAssignmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDeliveryAssignmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DeliveryAssignmentDto>> Handle(GetDeliveryAssignmentsQuery request, CancellationToken cancellationToken)
    {
        var statuses = new[] { OrderStatus.HandoverToDelivery, OrderStatus.InTransit, OrderStatus.OutForDelivery };
        
        var orders = await _context.Orders
            .Include(o => o.DeliveryVerification)
            .Where(o => o.DeliveryManId == request.DeliveryManId && statuses.Contains(o.Status))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        return orders.Select(o => new DeliveryAssignmentDto
        {
            Id = o.Id,
            Status = o.Status.ToString(), // Maps to "HandoverToDelivery", "InTransit", "OutForDelivery"
            Otp = o.DeliveryVerification?.OtpCode,
            AssignedAt = o.CreatedAt, // Use Order creation time as proxy for now
            Order = new DeliveryAssignmentDto.OrderDto
            {
                DeliveryAddress = o.DeliveryAddress
            }
        }).ToList();
    }
}
