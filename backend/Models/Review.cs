using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.Models;

public class Review
{
    public int Id { get; set; }
    
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    
    public int UserId { get; set; }
    public User? User { get; set; }
    
    public int Rating { get; set; }
    
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
