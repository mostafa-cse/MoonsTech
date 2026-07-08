using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Review.Commands;

public record AddReviewCommand(Guid UserId, Guid ProductId, int Rating, string Comment) : IRequest<bool>;

public class AddReviewCommandHandler : IRequestHandler<AddReviewCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AddReviewCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(AddReviewCommand request, CancellationToken cancellationToken)
    {
        // Check if user already reviewed
        var existing = await _context.Reviews
            .FirstOrDefaultAsync(r => r.UserId == request.UserId && r.ProductId == request.ProductId, cancellationToken);
            
        if (existing != null)
        {
            existing.Rating = request.Rating;
            existing.Comment = request.Comment;
            existing.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            _context.Reviews.Add(new Domain.Entities.Review
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                ProductId = request.ProductId,
                Rating = request.Rating,
                Comment = request.Comment
            });
        }
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
