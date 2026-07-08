using System.Collections.Generic;
using System.Linq;
using AestheticTechStore.Domain.Entities;
using AestheticTechStore.Domain.Specifications.PcBuilderRules;

namespace AestheticTechStore.Application.Features.PcBuilder;

public interface ICompatibilityEngine
{
    CompatibilityResult Evaluate(IEnumerable<Product> currentBuild, Product newComponent);
    int EstimateWattage(IEnumerable<Product> build);
}

public class CompatibilityEngine : ICompatibilityEngine
{
    private readonly IEnumerable<ICompatibilityRule> _rules;

    public CompatibilityEngine(IEnumerable<ICompatibilityRule> rules)
    {
        _rules = rules;
    }

    public CompatibilityResult Evaluate(IEnumerable<Product> currentBuild, Product newComponent)
    {
        // Chain of Responsibility pattern for rules
        foreach (var rule in _rules)
        {
            var result = rule.Check(currentBuild, newComponent);
            if (!result.IsCompatible)
            {
                return result; // Fast fail on first incompatibility
            }
        }
        
        return CompatibilityResult.Success();
    }

    public int EstimateWattage(IEnumerable<Product> build)
    {
        int totalWattage = 0;
        
        foreach (var component in build)
        {
            // Try parse TDP or Wattage specification
            var tdpSpec = component.Specifications.FirstOrDefault(s => 
                s.Key.ToLower() == "tdp" || 
                s.Key.ToLower() == "power_consumption" || 
                s.Key.ToLower() == "wattage")?.Value;

            if (!string.IsNullOrEmpty(tdpSpec))
            {
                // Simple parser, assuming format like "65W" or "65"
                var numericPart = new string(tdpSpec.Where(char.IsDigit).ToArray());
                if (int.TryParse(numericPart, out int watts))
                {
                    totalWattage += watts;
                }
            }
        }

        // Greedy sum with 20% headroom margin
        return (int)(totalWattage * 1.20);
    }
}
