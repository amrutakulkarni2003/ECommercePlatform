using System.Security.Claims;
using ECommerce.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WalletController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public WalletController(AppDbContext db)
    {
        _db = db;
    }
    
    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    [HttpGet]
    public async Task<IActionResult> GetWallet()
    {
        var userId = GetUserId();
        var balance = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.WalletBalance)
            .FirstOrDefaultAsync();
        
        return Ok(new { balance });
    }
}
