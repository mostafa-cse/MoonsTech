using System.Threading;
using System.Threading.Tasks;
using MediatR;
using AestheticTechStore.Application.Features.AiAdvisor;

namespace AestheticTechStore.Application.Features.AiAdvisor.Queries;

public record GetPcBuildRecommendationQuery(string UserPrompt) : IRequest<string>;

public class GetPcBuildRecommendationQueryHandler : IRequestHandler<GetPcBuildRecommendationQuery, string>
{
    private readonly IAiAdvisorService _aiAdvisorService;

    public GetPcBuildRecommendationQueryHandler(IAiAdvisorService aiAdvisorService)
    {
        _aiAdvisorService = aiAdvisorService;
    }

    public async Task<string> Handle(GetPcBuildRecommendationQuery request, CancellationToken cancellationToken)
    {
        return await _aiAdvisorService.GetRecommendationAsync(request.UserPrompt, cancellationToken);
    }
}
