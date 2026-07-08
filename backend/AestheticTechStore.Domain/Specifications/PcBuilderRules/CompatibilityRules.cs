using System.Collections.Generic;
using System.Linq;
using AestheticTechStore.Domain.Entities;

namespace AestheticTechStore.Domain.Specifications.PcBuilderRules;

public interface ICompatibilityRule
{
    CompatibilityResult Check(IEnumerable<Product> selectedComponents, Product newComponent);
}

public class CompatibilityResult
{
    public bool IsCompatible { get; }
    public string ErrorMessage { get; }

    private CompatibilityResult(bool isCompatible, string errorMessage)
    {
        IsCompatible = isCompatible;
        ErrorMessage = errorMessage;
    }

    public static CompatibilityResult Success() => new CompatibilityResult(true, string.Empty);
    public static CompatibilityResult Failure(string message) => new CompatibilityResult(false, message);
}

// Rule 1: Socket Compatibility
public class SocketCompatibilityRule : ICompatibilityRule
{
    public CompatibilityResult Check(IEnumerable<Product> selectedComponents, Product newComponent)
    {
        var components = selectedComponents.ToList();
        components.Add(newComponent);

        var cpu = components.FirstOrDefault(c => c.Category.Name.ToLower().Contains("processor") || c.Category.Name.ToLower().Contains("cpu"));
        var motherboard = components.FirstOrDefault(c => c.Category.Name.ToLower().Contains("motherboard"));

        if (cpu != null && motherboard != null)
        {
            var cpuSocket = cpu.Specifications.FirstOrDefault(s => s.Key.ToLower() == "socket")?.Value;
            var moboSocket = motherboard.Specifications.FirstOrDefault(s => s.Key.ToLower() == "socket")?.Value;

            if (!string.IsNullOrEmpty(cpuSocket) && !string.IsNullOrEmpty(moboSocket))
            {
                if (cpuSocket != moboSocket)
                {
                    return CompatibilityResult.Failure($"Socket mismatch: CPU uses {cpuSocket}, but Motherboard uses {moboSocket}.");
                }
            }
        }

        return CompatibilityResult.Success();
    }
}

// Rule 2: RAM Type Compatibility
public class RamTypeCompatibilityRule : ICompatibilityRule
{
    public CompatibilityResult Check(IEnumerable<Product> selectedComponents, Product newComponent)
    {
        var components = selectedComponents.ToList();
        components.Add(newComponent);

        var motherboard = components.FirstOrDefault(c => c.Category.Name.ToLower().Contains("motherboard"));
        var ram = components.FirstOrDefault(c => c.Category.Name.ToLower().Contains("ram"));

        if (motherboard != null && ram != null)
        {
            var moboRamType = motherboard.Specifications.FirstOrDefault(s => s.Key.ToLower() == "ram_type" || s.Key.ToLower() == "memory_type")?.Value;
            var ramType = ram.Specifications.FirstOrDefault(s => s.Key.ToLower() == "type" || s.Key.ToLower() == "memory_type")?.Value;

            if (!string.IsNullOrEmpty(moboRamType) && !string.IsNullOrEmpty(ramType))
            {
                // Simple Contains check (e.g., DDR4 vs DDR5)
                if (!moboRamType.Contains(ramType) && !ramType.Contains(moboRamType))
                {
                    return CompatibilityResult.Failure($"RAM Type mismatch: Motherboard supports {moboRamType}, but RAM is {ramType}.");
                }
            }
        }

        return CompatibilityResult.Success();
    }
}
