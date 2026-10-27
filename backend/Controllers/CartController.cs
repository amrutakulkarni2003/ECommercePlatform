using System.Security.Claims;
using ECommerce.API.Data;
using ECommerce.API.DTOs;
using ECommerce.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public CartController(AppDbContext db)
    {
        _db = db;
    }
    
    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetUserId();
        var items = await _db.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .Select(c => new CartItemDto
            {
                Id = c.Id,
                ProductId = c.ProductId,
                ProductName = c.Product!.Name,
                ImageUrl = c.Product.ImageUrl,
                Price = c.Product.Price,
                DiscountPrice = c.Product.DiscountPrice,
                Quantity = c.Quantity,
                Stock = c.Product.Stock
            })
            .ToListAsync();
        
        return Ok(items);
    }
    
    [HttpPost]
    public async Task<IActionResult> AddToCart(AddToCartDto dto)
    {
        var userId = GetUserId();
        
        var product = await _db.Products.FindAsync(dto.ProductId);
        if (product == null || !product.IsActive)
            return NotFound(new { message = "Product not found" });
        
        var existing = await _db.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId);
        
        var desiredQuantity = (existing?.Quantity ?? 0) + dto.Quantity;
        if (desiredQuantity > product.Stock)
            return BadRequest(new { message = $"Only {product.Stock} item(s) in stock" });
        
        if (existing != null)
        {
            existing.Quantity = desiredQuantity;
        }
        else
        {
            _db.CartItems.Add(new CartItem
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            });
        }
        
        await _db.SaveChangesAsync();
        return Ok(new { message = "Added to cart" });
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateQuantity(int id, UpdateCartQuantityDto dto)
    {
        var userId = GetUserId();
        var item = await _db.CartItems
            .Include(c => c.Product)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        
        if (item == null)
            return NotFound();
        
        if (dto.Quantity <= 0)
        {
            _db.CartItems.Remove(item);
        }
        else if (item.Product != null && dto.Quantity > item.Product.Stock)
        {
            return BadRequest(new { message = $"Only {item.Product.Stock} item(s) in stock" });
        }
        else
        {
            item.Quantity = dto.Quantity;
        }
        
        await _db.SaveChangesAsync();
        return Ok(new { message = "Cart updated" });
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveItem(int id)
    {
        var userId = GetUserId();
        var item = await _db.CartItems
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        
        if (item == null)
            return NotFound();
        
        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Item removed" });
    }
    
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();
        var items = await _db.CartItems.Where(c => c.UserId == userId).ToListAsync();
        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Cart cleared" });
    }
}
