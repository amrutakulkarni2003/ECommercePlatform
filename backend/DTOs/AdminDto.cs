namespace ECommerce.API.DTOs;

public class DashboardStatsDto
{
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public int TotalUsers { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingOrders { get; set; }
    public List<OrderDto> RecentOrders { get; set; } = new();
}
