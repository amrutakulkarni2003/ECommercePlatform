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
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public OrdersController(AppDbContext db)
    {
        _db = db;
    }
    
    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    [HttpPost("place")]
    public async Task<IActionResult> PlaceOrder(PlaceOrderDto dto)
    {
        var userId = GetUserId();
        var paymentMethod = dto.PaymentMethod?.Trim() ?? string.Empty;
        
        if (paymentMethod is not ("UPI" or "Card" or "Cash" or "COD" or "Wallet"))
            return BadRequest(new { message = "Choose a valid payment method: UPI, Card, Cash, or Wallet." });
        
        var cartItems = await _db.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync();
        
        if (!cartItems.Any())
            return BadRequest(new { message = "Cart is empty" });
        
        var outOfStock = cartItems.FirstOrDefault(c => c.Product!.Stock < c.Quantity);
        if (outOfStock != null)
            return BadRequest(new { message = $"Not enough stock for {outOfStock.Product!.Name}. Available: {outOfStock.Product!.Stock}" });
        
        var totalAmount = cartItems.Sum(c => (c.Product!.DiscountPrice ?? c.Product.Price) * c.Quantity);
        
        if (paymentMethod == "Wallet")
        {
            var walletUser = await _db.Users.FindAsync(userId);
            if (walletUser == null)
                return NotFound();
            if (walletUser.WalletBalance < totalAmount)
                return BadRequest(new { message = "Not enough wallet balance for this order." });
            
            walletUser.WalletBalance -= totalAmount;
        }
        
        var order = new Order
        {
            UserId = userId,
            ShippingAddress = dto.ShippingAddress,
            PaymentMethod = paymentMethod,
            PaymentStatus = paymentMethod is "Cash" or "COD" ? "Pending" : "Paid",
            Status = "Placed",
            TotalAmount = totalAmount
        };
        
        foreach (var item in cartItems)
        {
            order.OrderItems.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                Price = item.Product!.DiscountPrice ?? item.Product.Price
            });
            
            item.Product.Stock -= item.Quantity;
        }
        
        _db.Orders.Add(order);
        _db.CartItems.RemoveRange(cartItems);
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Order placed successfully", orderId = order.Id });
    }
    
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = GetUserId();
        var order = await _db.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        
        if (order == null)
            return NotFound();
        
        if (order.Status == "Cancelled")
            return BadRequest(new { message = "This order is already cancelled." });
        
        if (order.Status is "Shipped" or "Delivered")
            return BadRequest(new { message = "Shipped or delivered orders cannot be cancelled." });
        
        var refundedAmount = 0m;
        if (order.PaymentStatus == "Paid")
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
                return NotFound();
            
            refundedAmount = order.TotalAmount;
            user.WalletBalance += refundedAmount;
            order.PaymentStatus = "Refunded";
        }
        
        foreach (var item in order.OrderItems)
        {
            if (item.Product != null)
                item.Product.Stock += item.Quantity;
        }
        
        order.Status = "Cancelled";
        await _db.SaveChangesAsync();
        
        var walletBalance = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.WalletBalance)
            .FirstOrDefaultAsync();
        
        return Ok(new
        {
            message = refundedAmount > 0
                ? "Order cancelled and the amount was refunded to your wallet."
                : "Order cancelled successfully.",
            refundedAmount,
            walletBalance
        });
    }
    
    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();
        var orders = await _db.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
                PaymentStatus = o.PaymentStatus,
                ShippingAddress = o.ShippingAddress,
                OrderDate = o.OrderDate,
                Items = o.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product!.Name,
                    ImageUrl = oi.Product.ImageUrl,
                    Price = oi.Price,
                    Quantity = oi.Quantity
                }).ToList()
            })
            .ToListAsync();
        
        return Ok(orders);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var userId = GetUserId();
        var order = await _db.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        
        if (order == null)
            return NotFound();
        
        var dto = new OrderDto
        {
            Id = order.Id,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            ShippingAddress = order.ShippingAddress,
            OrderDate = order.OrderDate,
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.Product!.Name,
                ImageUrl = oi.Product.ImageUrl,
                Price = oi.Price,
                Quantity = oi.Quantity
            }).ToList()
        };
        
        return Ok(dto);
    }
}
