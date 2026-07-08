using System.Threading.Tasks;
using AestheticTechStore.Domain.Entities;

namespace AestheticTechStore.Application.Interfaces;

public interface IJwtProvider
{
    Task<string> GenerateTokenAsync(User user);
}
