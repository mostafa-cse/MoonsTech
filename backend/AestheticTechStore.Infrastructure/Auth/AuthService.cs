using System;
using System.Linq;
using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Auth.Commands;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Entities;
using AestheticTechStore.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace AestheticTechStore.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IJwtProvider _jwtProvider;

    public AuthService(UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager, IJwtProvider jwtProvider)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtProvider = jwtProvider;
    }

    public async Task<AuthResult> RegisterAsync(string email, string password, string fullName, string phoneNumber, Role role)
    {
        var user = new User
        {
            UserName = email,
            Email = email,
            PhoneNumber = phoneNumber,
            Role = role,
            IsVerified = false,
            Profile = new UserProfile()
        };

        var result = await _userManager.CreateAsync(user, password);
        
        if (!result.Succeeded)
        {
            return new AuthResult(false, string.Empty, string.Join(", ", result.Errors.Select(e => e.Description)), role.ToString());
        }

        var roleName = role.ToString();
        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
        }

        await _userManager.AddToRoleAsync(user, roleName);

        var token = await _jwtProvider.GenerateTokenAsync(user);

        return new AuthResult(true, token, "Registration successful.", role.ToString());
    }

    public async Task<AuthResult> LoginAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        
        if (user == null)
        {
            return new AuthResult(false, string.Empty, "Invalid credentials.", string.Empty);
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, password);
        
        if (!isPasswordValid)
        {
            return new AuthResult(false, string.Empty, "Invalid credentials.", string.Empty);
        }

        var token = await _jwtProvider.GenerateTokenAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? user.Role.ToString();

        return new AuthResult(true, token, "Login successful.", primaryRole);
    }
}
