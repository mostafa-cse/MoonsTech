using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Domain.Entities;
using AestheticTechStore.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AestheticTechStore.Application.Features.Admin.Commands;

public class UpdateAdminUserRoleCommand : IRequest<bool>
{
    public Guid UserId { get; set; }
    public string Role { get; set; }
}

public class UpdateAdminUserRoleCommandHandler : IRequestHandler<UpdateAdminUserRoleCommand, bool>
{
    private readonly UserManager<User> _userManager;

    public UpdateAdminUserRoleCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<bool> Handle(UpdateAdminUserRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null) return false;

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);

        var newRole = request.Role;
        if (newRole.Equals("super_admin", StringComparison.OrdinalIgnoreCase)) newRole = "Admin";
        if (newRole.Equals("delivery_man", StringComparison.OrdinalIgnoreCase)) newRole = "DeliveryMan";
        
        // update enum
        if (Enum.TryParse<Role>(newRole, true, out var roleEnum))
        {
            user.Role = roleEnum;
            await _userManager.UpdateAsync(user);
        }

        await _userManager.AddToRoleAsync(user, newRole);

        return true;
    }
}
