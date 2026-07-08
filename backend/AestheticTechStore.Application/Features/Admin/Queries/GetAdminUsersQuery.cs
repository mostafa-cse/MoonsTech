using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace AestheticTechStore.Application.Features.Admin.Queries;

public record GetAdminUsersQuery() : IRequest<List<AdminUserDto>>;

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
    public string Status { get; set; }
}

public class GetAdminUsersQueryHandler : IRequestHandler<GetAdminUsersQuery, List<AdminUserDto>>
{
    private readonly UserManager<User> _userManager;

    public GetAdminUsersQueryHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<List<AdminUserDto>> Handle(GetAdminUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userManager.Users.ToListAsync(cancellationToken);
        var result = new List<AdminUserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(new AdminUserDto
            {
                Id = user.Id,
                Name = user.UserName, // Could use profile name if available
                Email = user.Email,
                Role = roles.FirstOrDefault()?.ToLower() ?? user.Role.ToString().ToLower(),
                Status = user.IsVerified ? "active" : "inactive" // Simplification
            });
        }

        return result;
    }
}
