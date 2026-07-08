using System;
using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using AestheticTechStore.Domain.Enums;
using FluentValidation;
using MediatR;

namespace AestheticTechStore.Application.Features.Auth.Commands;

public record RegisterUserCommand(string Email, string Password, string FullName, string PhoneNumber, Role Role = Role.Buyer) : IRequest<AuthResult>;

public record AuthResult(bool Success, string Token, string Message, string Role = "Buyer");

public class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.FullName).NotEmpty();
    }
}

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, AuthResult>
{
    private readonly IAuthService _authService;

    public RegisterUserCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<AuthResult> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        return await _authService.RegisterAsync(request.Email, request.Password, request.FullName, request.PhoneNumber, request.Role);
    }
}
