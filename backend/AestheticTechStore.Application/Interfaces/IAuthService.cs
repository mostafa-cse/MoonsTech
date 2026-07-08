using System.Threading.Tasks;
using AestheticTechStore.Application.Features.Auth.Commands;
using AestheticTechStore.Domain.Enums;

namespace AestheticTechStore.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(string email, string password, string fullName, string phoneNumber, Role role);
    Task<AuthResult> LoginAsync(string email, string password);
}
