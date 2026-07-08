using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Coupons.Queries;

public record GetAllCouponsQuery() : IRequest<List<CouponDto>>;

public class CouponDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
    public string DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MinimumOrderAmount { get; set; }
    public decimal? MaximumDiscount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? UsageLimit { get; set; }
    public int UsageCount { get; set; }
    public bool IsActive { get; set; }
}

public class GetAllCouponsQueryHandler : IRequestHandler<GetAllCouponsQuery, List<CouponDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllCouponsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CouponDto>> Handle(GetAllCouponsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Coupons
            .Select(c => new CouponDto
            {
                Id = c.Id,
                Code = c.Code,
                Description = "Coupon " + c.Code,
                DiscountType = c.DiscountType == DiscountType.Percentage ? "percentage" : "fixed_amount",
                DiscountValue = c.Value,
                MinimumOrderAmount = c.MinOrderAmount,
                MaximumDiscount = c.MaxDiscountCap,
                StartDate = c.ValidFrom,
                EndDate = c.ValidTo,
                UsageLimit = c.UsageLimitTotal,
                UsageCount = 0,
                IsActive = c.ValidFrom <= DateTime.UtcNow && c.ValidTo >= DateTime.UtcNow
            })
            .ToListAsync(cancellationToken);
    }
}
