using System.Threading;
using System.Threading.Tasks;
using AestheticTechStore.Application.Interfaces;
using FluentValidation;
using MediatR;

namespace AestheticTechStore.Application.Features.Auth.Commands;

public record LoginUserCommand(string Email, string Password) : IRequest<AuthResult>;

public class LoginUserValidator : AbstractValidator<LoginUserCommand>
{
    public LoginUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, AuthResult>
{
    private readonly IAuthService _authService;

    public LoginUserCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<AuthResult> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        return await _authService.LoginAsync(request.Email, request.Password);
    }
}
