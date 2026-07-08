using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AestheticTechStore.Application.Features.Admin.Commands;

public class UpdateAdminUserStatusCommand : IRequest<bool>
{
    public Guid UserId { get; set; }
    public string Status { get; set; }
}

public class UpdateAdminUserStatusCommandHandler : IRequestHandler<UpdateAdminUserStatusCommand, bool>
{
    private readonly UserManager<User> _userManager;

    public UpdateAdminUserStatusCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<bool> Handle(UpdateAdminUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null) return false;

        // Basic map
        if (request.Status == "active") user.IsVerified = true;
        if (request.Status == "inactive" || request.Status == "blocked") user.IsVerified = false;

        await _userManager.UpdateAsync(user);

        return true;
    }
}
