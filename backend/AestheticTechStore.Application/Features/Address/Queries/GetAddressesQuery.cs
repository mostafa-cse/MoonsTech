using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AestheticTechStore.Application.Features.Address.Queries;

public record GetAddressesQuery(Guid UserId) : IRequest<List<AddressDto>>;

public class AddressDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; }
    public string Phone { get; set; }
    public string Division { get; set; }
    public string District { get; set; }
    public string Thana { get; set; }
    public string FullAddress { get; set; }
    public bool IsDefault { get; set; }
}

public class GetAddressesQueryHandler : IRequestHandler<GetAddressesQuery, List<AddressDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAddressesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AddressDto>> Handle(GetAddressesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Addresses
            .Where(a => a.UserId == request.UserId)
            .Select(a => new AddressDto
            {
                Id = a.Id,
                FullName = a.FullName,
                Phone = a.Phone,
                Division = a.Division,
                District = a.District,
                Thana = a.Thana,
                FullAddress = a.FullAddress,
                IsDefault = a.IsDefault
            })
            .ToListAsync(cancellationToken);
    }
}
