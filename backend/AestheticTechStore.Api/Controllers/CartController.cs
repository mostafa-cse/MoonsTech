using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AestheticTechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    // Temporary In-Memory store to avoid EF Core migrations for this phase
    private static readonly Dictionary<string, CartDto> _carts = new();

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private CartDto GetCartInternal()
    {
        var userId = UserId ?? "guest";
        if (!_carts.ContainsKey(userId))
        {
            _carts[userId] = new CartDto { Items = new List<CartItemDto>(), Subtotal = 0, ItemCount = 0 };
        }
        return _carts[userId];
    }

    [HttpGet]
    public IActionResult GetCart()
    {
        return Ok(GetCartInternal());
    }

    [HttpPost("add")]
    public IActionResult AddToCart([FromBody] AddToCartRequest request)
    {
        var cart = GetCartInternal();
        
        var existing = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
        if (existing != null)
        {
            existing.Quantity += request.Quantity;
            existing.TotalPrice = existing.Quantity * existing.UnitPrice;
        }
        else
        {
            cart.Items.Add(new CartItemDto
            {
                Id = Guid.NewGuid(),
                ProductId = request.ProductId,
                Name = request.Name,
                Slug = request.Slug,
                Image = request.Image,
                Sku = request.Sku,
                UnitPrice = request.UnitPrice,
                Quantity = request.Quantity,
                TotalPrice = request.Quantity * request.UnitPrice
            });
        }
        
        UpdateCartTotals(cart);
        return Ok(cart);
    }

    [HttpPut("update-quantity")]
    public IActionResult UpdateQuantity([FromBody] UpdateQuantityRequest request)
    {
        var cart = GetCartInternal();
        var item = cart.Items.FirstOrDefault(i => i.Id == request.ItemId);
        if (item != null)
        {
            item.Quantity = request.Quantity;
            item.TotalPrice = item.Quantity * item.UnitPrice;
            UpdateCartTotals(cart);
        }
        return Ok(cart);
    }

    [HttpDelete("remove/{itemId}")]
    public IActionResult RemoveItem(Guid itemId)
    {
        var cart = GetCartInternal();
        cart.Items.RemoveAll(i => i.Id == itemId);
        UpdateCartTotals(cart);
        return Ok(cart);
    }

    [HttpPost("clear")]
    public IActionResult ClearCart()
    {
        var cart = GetCartInternal();
        cart.Items.Clear();
        UpdateCartTotals(cart);
        return Ok(cart);
    }

    private void UpdateCartTotals(CartDto cart)
    {
        cart.ItemCount = cart.Items.Sum(i => i.Quantity);
        cart.Subtotal = cart.Items.Sum(i => i.TotalPrice);
    }
}

public class CartDto
{
    public List<CartItemDto> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public int ItemCount { get; set; }
}

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}

public class AddToCartRequest
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}

public class UpdateQuantityRequest
{
    public Guid ItemId { get; set; }
    public int Quantity { get; set; }
}
