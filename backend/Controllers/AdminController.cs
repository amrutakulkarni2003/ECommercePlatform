using ECommerce.API.Data;
using ECommerce.API.DTOs;
using ECommerce.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private static readonly string[] OrderStatuses =
    {
        "Pending", "Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"
    };

    private static readonly Dictionary<string, string[]> AllowedStatusTransitions = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Pending"] = new[] { "Confirmed", "Cancelled" },
        ["Placed"] = new[] { "Confirmed", "Cancelled" },
        ["Confirmed"] = new[] { "Shipped", "Cancelled" },
        ["Shipped"] = new[] { "Delivered" },
        ["Delivered"] = Array.Empty<string>(),
        ["Cancelled"] = Array.Empty<string>()
    };

    private readonly AppDbContext _db;
    
    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    private static string? NormalizeStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return null;

        return OrderStatuses.FirstOrDefault(
            value => string.Equals(value, status.Trim(), StringComparison.OrdinalIgnoreCase));
    }
    
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var stats = new DashboardStatsDto
        {
            TotalProducts = await _db.Products.CountAsync(p => p.IsActive),
            TotalOrders = await _db.Orders.CountAsync(),
            TotalUsers = await _db.Users.CountAsync(u => u.Role == "Customer"),
            TotalRevenue = await _db.Orders
                .Where(o => o.PaymentStatus == "Paid")
                .SumAsync(o => o.TotalAmount),
            PendingOrders = await _db.Orders.CountAsync(o => o.Status == "Placed" || o.Status == "Pending"),
            RecentOrders = await _db.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
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
                .ToListAsync()
        };
        
        return Ok(stats);
    }
    
    [HttpGet("orders")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _db.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new
            {
                o.Id,
                CustomerName = o.User!.Name,
                CustomerEmail = o.User.Email,
                o.TotalAmount,
                o.Status,
                o.PaymentMethod,
                o.PaymentStatus,
                o.ShippingAddress,
                o.OrderDate,
                Items = o.OrderItems.Select(oi => new
                {
                    oi.ProductId,
                    ProductName = oi.Product!.Name,
                    oi.Price,
                    oi.Quantity
                }).ToList()
            })
            .ToListAsync();
        
        return Ok(orders);
    }
    
    [HttpPut("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
    {
        var order = await _db.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound();

        var targetStatus = NormalizeStatus(status);
        if (targetStatus == null)
            return BadRequest(new { message = "Choose a valid order status." });

        if (string.Equals(order.Status, targetStatus, StringComparison.OrdinalIgnoreCase))
            return Ok(new { message = "Order status is already up to date.", status = order.Status });

        var currentStatus = NormalizeStatus(order.Status) ?? order.Status;
        if (!AllowedStatusTransitions.TryGetValue(currentStatus, out var allowed) ||
            !allowed.Contains(targetStatus, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = $"Order cannot move from {order.Status} to {targetStatus}." });
        }

        var refundedAmount = 0m;

        if (targetStatus == "Cancelled")
        {
            if (order.PaymentStatus == "Paid" && order.User != null)
            {
                refundedAmount = order.TotalAmount;
                order.User.WalletBalance += refundedAmount;
                order.PaymentStatus = "Refunded";
            }

            foreach (var item in order.OrderItems)
            {
                if (item.Product != null)
                    item.Product.Stock += item.Quantity;
            }
        }

        if (targetStatus == "Delivered" && order.PaymentMethod is "Cash" or "COD")
            order.PaymentStatus = "Paid";

        order.Status = targetStatus;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = targetStatus == "Cancelled"
                ? (refundedAmount > 0
                    ? "Order cancelled and the amount was refunded to the customer's wallet."
                    : "Order cancelled successfully.")
                : "Order status updated",
            status = order.Status,
            refundedAmount
        });
    }
    
    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Brand = dto.Brand,
            Description = dto.Description,
            Price = dto.Price,
            DiscountPrice = dto.DiscountPrice,
            Stock = dto.Stock,
            ImageUrl = dto.ImageUrl,
            CategoryId = dto.CategoryId
        };
        
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Product created", productId = product.Id });
    }
    
    [HttpPut("products/{id}")]
    public async Task<IActionResult> UpdateProduct(int id, CreateProductDto dto)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
            return NotFound();
        
        product.Name = dto.Name;
        product.Brand = dto.Brand;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.DiscountPrice = dto.DiscountPrice;
        product.Stock = dto.Stock;
        product.ImageUrl = dto.ImageUrl;
        product.CategoryId = dto.CategoryId;
        
        await _db.SaveChangesAsync();
        return Ok(new { message = "Product updated" });
    }
    
    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
            return NotFound();
        
        product.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Product deleted" });
    }
    
    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name,
            Description = request.Description
        };
        
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Category created", categoryId = category.Id });
    }
    
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _db.Users
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Phone,
                u.Role,
                u.CreatedAt
            })
            .ToListAsync();
        
        return Ok(users);
    }
}

public class CategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
