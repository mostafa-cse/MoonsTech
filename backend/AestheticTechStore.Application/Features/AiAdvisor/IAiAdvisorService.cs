using System.Threading;
using System.Threading.Tasks;

namespace AestheticTechStore.Application.Features.AiAdvisor;

public interface IAiAdvisorService
{
    Task<string> GetRecommendationAsync(string userPrompt, CancellationToken cancellationToken = default);
}
