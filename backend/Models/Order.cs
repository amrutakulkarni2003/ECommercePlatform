using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerce.API.Models;

public class Order
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    public User? User { get; set; }
    
    [MaxLength(500)]
    public string ShippingAddress { get; set; } = string.Empty;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }
    
    [MaxLength(20)]
    public string Status { get; set; } = "Placed";
    
    [MaxLength(20)]
    public string PaymentMethod { get; set; } = "Cash";
    
    [MaxLength(20)]
    public string PaymentStatus { get; set; } = "Pending";
    
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
