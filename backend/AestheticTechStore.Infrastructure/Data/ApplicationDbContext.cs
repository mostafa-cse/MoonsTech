using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace AestheticTechStore.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        return Database.BeginTransactionAsync(cancellationToken);
    }

    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Brand> Brands { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductSpecification> ProductSpecifications { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<DeliveryVerification> DeliveryVerifications { get; set; }
    public DbSet<PcBuild> PcBuilds { get; set; }
    public DbSet<PcBuildComponent> PcBuildComponents { get; set; }
    
    public DbSet<Address> Addresses { get; set; }
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<MegaCoinLedger> MegaCoinLedgers => Set<MegaCoinLedger>();
    public DbSet<Banner> Banners => Set<Banner>();
    public DbSet<Wishlist> Wishlists { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure schemas and relations

        builder.Entity<User>()
            .HasOne(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<UserProfile>(p => p.UserId);

        builder.Entity<Category>()
            .HasMany(c => c.SubCategories)
            .WithOne(c => c.ParentCategory)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Optimistic Concurrency on Product Stock
        builder.Entity<Product>()
            .Property(p => p.RowVersion)
            .IsConcurrencyToken();

        // Indexes
        builder.Entity<Product>()
            .HasIndex(p => new { p.CategoryId, p.Status });
            
        builder.Entity<MegaCoinLedger>()
            .HasIndex(m => new { m.UserId, m.CreatedAt });
            
        builder.Entity<Coupon>()
            .HasIndex(c => c.Code)
            .IsUnique();

        // Enum conversions (optional, but good for readability in DB)
        builder.Entity<Order>()
            .Property(o => o.Status)
            .HasConversion<string>();
            
        builder.Entity<Order>()
            .Property(o => o.PaymentMethod)
            .HasConversion<string>();

        builder.Entity<Product>()
            .Property(p => p.Status)
            .HasConversion<string>();
            
        builder.Entity<MegaCoinLedger>()
            .Property(m => m.Reason)
            .HasConversion<string>();
            
        builder.Entity<PcBuildComponent>()
            .Property(p => p.Slot)
            .HasConversion<string>();
    }
}
