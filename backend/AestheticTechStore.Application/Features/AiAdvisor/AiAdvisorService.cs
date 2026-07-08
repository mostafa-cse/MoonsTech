using System;
using System.ComponentModel;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace AestheticTechStore.Application.Features.AiAdvisor;

public class AiAdvisorService : IAiAdvisorService
{
    private readonly Kernel _kernel;

    public AiAdvisorService(IConfiguration configuration, IServiceProvider serviceProvider)
    {
        // Setup Semantic Kernel with OpenAI
        var apiKey = configuration["OpenAI:ApiKey"] ?? "sk-placeholder"; // Ensure this is configured in appsettings.json or secrets
        var builder = Kernel.CreateBuilder()
            .AddOpenAIChatCompletion("gpt-4o", apiKey);

        // Add the PC Builder tools as a plugin
        builder.Plugins.AddFromObject(new PcBuilderPlugin(serviceProvider), "PcBuilderPlugin");
        
        _kernel = builder.Build();
    }

    public async Task<string> GetRecommendationAsync(string userPrompt, CancellationToken cancellationToken = default)
    {
        var executionSettings = new OpenAIPromptExecutionSettings
        {
            ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
            Temperature = 0.2
        };

        var systemPrompt = @"You are the AestheticTechStore AI PC Builder Advisor.
Your goal is to recommend a fully compatible PC build based on the user's requirements (e.g., budget, usage).
You MUST use your 'SearchProducts' tool to find available components in our catalog.
Once you have selected the components, you MUST use your 'ValidateBuildCompatibility' tool to ensure they are compatible.
Return your final recommendation as a neatly formatted markdown list including the estimated total price and wattage.";

        var prompt = $"{systemPrompt}\n\nUser Request: {userPrompt}";

        var result = await _kernel.InvokePromptAsync(prompt, new KernelArguments(executionSettings), cancellationToken: cancellationToken);

        return result.ToString();
    }
}
