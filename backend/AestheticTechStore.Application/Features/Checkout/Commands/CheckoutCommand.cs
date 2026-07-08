using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using AestheticTechStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Checkout.Commands;

public record CheckoutCommand(Guid UserId, List<CheckoutItem> Items, Guid? CouponId, PaymentMethod PaymentMethod, string DeliveryAddress = null) : IRequest<CheckoutResult>;
public record CheckoutItem(Guid ProductId, int Quantity);
public record CheckoutResult(bool Success, Guid OrderId, string Message);

public class CheckoutCommandHandler : IRequestHandler<CheckoutCommand, CheckoutResult>
{
    private readonly IApplicationDbContext _context;

    public CheckoutCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CheckoutResult> Handle(CheckoutCommand request, CancellationToken cancellationToken)
    {
        // 1. Begin Database Transaction to ensure Atomicity
        using var transaction = await _context.BeginTransactionAsync(cancellationToken);
        try
        {
            var productIds = request.Items.Select(i => i.ProductId).ToList();
            
            // 2. Load products. EF Core will track RowVersion for Optimistic Concurrency
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync(cancellationToken);

            var order = new Domain.Entities.Order
            {
                Id = Guid.NewGuid(),
                BuyerId = request.UserId,
                Status = OrderStatus.Pending,
                PaymentMethod = request.PaymentMethod,
                PaymentReference = $"REF-{Guid.NewGuid().ToString().Substring(0,8).ToUpper()}",
                DeliveryAddress = request.DeliveryAddress
            };

            decimal totalAmount = 0;
            int totalCoinsEarned = 0;

            foreach (var item in request.Items)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                if (product == null) throw new Exception($"Product {item.ProductId} not found.");

                // 3. Concurrency / Stock check
                if (product.StockQuantity < item.Quantity)
                {
                    return new CheckoutResult(false, Guid.Empty, $"Insufficient stock for {product.Name}");
                }

                product.StockQuantity -= item.Quantity; // Will throw DbUpdateConcurrencyException on Save if RowVersion mismatch

                var unitPrice = product.DiscountPrice ?? product.RegularPrice;
                totalAmount += unitPrice * item.Quantity;
                totalCoinsEarned += product.MegaCoinReward * item.Quantity;

                order.Items.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPriceAtPurchase = unitPrice
                });
            }

            // Coupon Logic would apply to totalAmount here...
            order.TotalAmount = totalAmount;
            _context.Orders.Add(order);

            // 4. MegaCoin Ledger Append-Only (Event Sourcing approach)
            if (totalCoinsEarned > 0)
            {
                var ledgerEntry = new MegaCoinLedger
                {
                    Id = Guid.NewGuid(),
                    UserId = request.UserId,
                    Delta = totalCoinsEarned,
                    Reason = MegaCoinTransactionReason.EarnedFromOrder,
                    OrderId = order.Id
                };
                _context.MegaCoinLedgers.Add(ledgerEntry);
            }

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return new CheckoutResult(true, order.Id, "Checkout completed successfully.");
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return new CheckoutResult(false, Guid.Empty, "A product in your cart just went out of stock. Please try again.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return new CheckoutResult(false, Guid.Empty, ex.Message);
        }
    }
}
