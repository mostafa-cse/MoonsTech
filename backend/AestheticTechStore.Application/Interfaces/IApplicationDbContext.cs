using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace AestheticTechStore.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<UserProfile> UserProfiles { get; }
    DbSet<Category> Categories { get; }
    DbSet<Brand> Brands { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductSpecification> ProductSpecifications { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<DeliveryVerification> DeliveryVerifications { get; }
    DbSet<MegaCoinLedger> MegaCoinLedgers { get; }
    DbSet<Coupon> Coupons { get; }
    DbSet<PcBuild> PcBuilds { get; }
    DbSet<PcBuildComponent> PcBuildComponents { get; }
    DbSet<Address> Addresses { get; }
    DbSet<Wishlist> Wishlists { get; }
    DbSet<Review> Reviews { get; }
    DbSet<Banner> Banners { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
}
