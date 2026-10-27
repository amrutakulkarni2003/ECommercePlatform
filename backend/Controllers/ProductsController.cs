using ECommerce.API.Data;
using ECommerce.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public ProductsController(AppDbContext db)
    {
        _db = db;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? search,
        [FromQuery] string? brand,
        [FromQuery] int? categoryId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var query = _db.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive);
        
        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));
        
        if (!string.IsNullOrWhiteSpace(brand))
            query = query.Where(p => p.Brand == brand);
        
        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);
        
        if (minPrice.HasValue)
            query = query.Where(p => (p.DiscountPrice ?? p.Price) >= minPrice.Value);
        
        if (maxPrice.HasValue)
            query = query.Where(p => (p.DiscountPrice ?? p.Price) <= maxPrice.Value);
        
        query = sortBy switch
        {
            "price_asc" => query.OrderBy(p => p.DiscountPrice ?? p.Price),
            "price_desc" => query.OrderByDescending(p => p.DiscountPrice ?? p.Price),
            "rating" => query.OrderByDescending(p => p.Rating),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };
        
        var total = await query.CountAsync();
        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Brand = p.Brand,
                Description = p.Description,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId,
                CategoryName = p.Category!.Name,
                Rating = p.Rating,
                ReviewCount = p.ReviewCount
            })
            .ToListAsync();
        
        return Ok(new { products, total, page, pageSize });
    }
    
    [HttpGet("brands")]
    public async Task<IActionResult> GetBrands()
    {
        var brands = await _db.Products
            .Where(p => p.IsActive && p.Brand != "")
            .GroupBy(p => p.Brand)
            .Select(g => new { Name = g.Key, Count = g.Count() })
            .OrderBy(b => b.Name)
            .ToListAsync();
        
        return Ok(brands);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
        
        if (product == null)
            return NotFound();
        
        var dto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Brand = product.Brand,
            Description = product.Description,
            Price = product.Price,
            DiscountPrice = product.DiscountPrice,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? "",
            Rating = product.Rating,
            ReviewCount = product.ReviewCount
        };
        
        return Ok(dto);
    }
    
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _db.Categories.ToListAsync();
        return Ok(categories);
    }
    
    [HttpGet("{id}/reviews")]
    public async Task<IActionResult> GetReviews(int id)
    {
        var reviews = await _db.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == id)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                UserName = r.User!.Name,
                r.CreatedAt
            })
            .ToListAsync();
        
        return Ok(reviews);
    }
}
