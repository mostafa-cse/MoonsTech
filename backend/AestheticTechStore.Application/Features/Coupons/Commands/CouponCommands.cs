using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Coupons.Commands;

public class CreateCouponCommand : IRequest<Guid>
{
    public string Code { get; set; }
    public string Description { get; set; }
    public string DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MinimumOrderAmount { get; set; }
    public decimal? MaximumDiscount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? UsageLimit { get; set; }
    public bool IsActive { get; set; }
}

public class CreateCouponCommandHandler : IRequestHandler<CreateCouponCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateCouponCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = new Coupon
        {
            Code = request.Code,
            DiscountType = request.DiscountType == "percentage" ? DiscountType.Percentage : DiscountType.FixedAmount,
            Value = request.DiscountValue,
            MinOrderAmount = request.MinimumOrderAmount ?? 0,
            MaxDiscountCap = request.MaximumDiscount,
            ValidFrom = request.StartDate,
            ValidTo = request.EndDate,
            UsageLimitTotal = request.UsageLimit ?? 0
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync(cancellationToken);
        return coupon.Id;
    }
}

public class UpdateCouponCommand : IRequest<bool>
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
    public bool IsActive { get; set; }
}

public class UpdateCouponCommandHandler : IRequestHandler<UpdateCouponCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateCouponCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (coupon == null) return false;

        coupon.Code = request.Code ?? coupon.Code;
        if (request.DiscountType != null) {
            coupon.DiscountType = request.DiscountType == "percentage" ? DiscountType.Percentage : DiscountType.FixedAmount;
        }
        coupon.Value = request.DiscountValue;
        coupon.MinOrderAmount = request.MinimumOrderAmount ?? coupon.MinOrderAmount;
        coupon.MaxDiscountCap = request.MaximumDiscount;
        coupon.ValidFrom = request.StartDate;
        coupon.ValidTo = request.EndDate;
        coupon.UsageLimitTotal = request.UsageLimit ?? coupon.UsageLimitTotal;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public class DeleteCouponCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteCouponCommandHandler : IRequestHandler<DeleteCouponCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteCouponCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (coupon == null) return false;

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
