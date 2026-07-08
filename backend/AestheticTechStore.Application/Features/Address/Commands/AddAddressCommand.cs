using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Address.Commands;

public record AddAddressCommand(
    Guid UserId, 
    string FullName, 
    string Phone, 
    string Division, 
    string District, 
    string Thana, 
    string FullAddress, 
    bool IsDefault
) : IRequest<bool>;

public class AddAddressCommandHandler : IRequestHandler<AddAddressCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AddAddressCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(AddAddressCommand request, CancellationToken cancellationToken)
    {
        if (request.IsDefault)
        {
            var existingDefaults = await _context.Addresses
                .Where(a => a.UserId == request.UserId && a.IsDefault)
                .ToListAsync(cancellationToken);
            foreach (var addr in existingDefaults)
            {
                addr.IsDefault = false;
            }
        }

        var newAddress = new Domain.Entities.Address
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            FullName = request.FullName,
            Phone = request.Phone,
            Division = request.Division,
            District = request.District,
            Thana = request.Thana,
            FullAddress = request.FullAddress,
            IsDefault = request.IsDefault
        };

        _context.Addresses.Add(newAddress);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
