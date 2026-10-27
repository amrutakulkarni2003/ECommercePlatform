using System.Security.Claims;
using ECommerce.API.Data;
using ECommerce.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public ReviewsController(AppDbContext db)
    {
        _db = db;
    }
    
    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    [HttpPost("product/{productId}")]
    public async Task<IActionResult> AddReview(int productId, [FromBody] ReviewRequest request)
    {
        var userId = GetUserId();
        
        var product = await _db.Products.FindAsync(productId);
        if (product == null)
            return NotFound();
        
        var review = new Review
        {
            ProductId = productId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment
        };
        
        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();
        
        var ratings = await _db.Reviews
            .Where(r => r.ProductId == productId)
            .Select(r => r.Rating)
            .ToListAsync();
        
        if (ratings.Count > 0)
        {
            product.Rating = Math.Round(ratings.Average(), 1);
            product.ReviewCount = ratings.Count;
        }
        
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Review added" });
    }
}

public class ReviewRequest
{
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
