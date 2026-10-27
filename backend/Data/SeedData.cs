using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync())
            return;
        
        var admin = new User
        {
            Name = "Admin",
            Email = "admin@shop.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "Admin",
            Phone = "9999999999"
        };
        
        var customer = new User
        {
            Name = "John Doe",
            Email = "john@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("John@123"),
            Role = "Customer",
            Phone = "8888888888"
        };
        
        db.Users.AddRange(admin, customer);
        
        var categories = new List<Category>
        {
            new() { Name = "Electronics", Description = "Electronic devices and gadgets" },
            new() { Name = "Clothing", Description = "Fashion and apparel" },
            new() { Name = "Books", Description = "Books and literature" },
            new() { Name = "Home & Kitchen", Description = "Home appliances and kitchen items" },
            new() { Name = "Sports", Description = "Sports and fitness equipment" },
            new() { Name = "Snacks", Description = "Chips, biscuits, chocolates, noodles and quick bites" }
        };
        
        db.Categories.AddRange(categories);
        await db.SaveChangesAsync();
        
        var products = new List<Product>
        {
            new() { Name = "Wireless Bluetooth Headphones", Brand = "Sony", Description = "Premium noise-cancelling wireless headphones with 30-hour battery life", Price = 2999, DiscountPrice = 1999, Stock = 50, ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", CategoryId = categories[0].Id, Rating = 4.5, ReviewCount = 120 },
            new() { Name = "Smartphone Pro Max", Brand = "Apple", Description = "Latest flagship smartphone with 6.7-inch display and triple camera", Price = 89999, DiscountPrice = 79999, Stock = 30, ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", CategoryId = categories[0].Id, Rating = 4.7, ReviewCount = 250 },
            new() { Name = "Laptop Ultra Slim", Brand = "Dell", Description = "14-inch ultrabook with Intel i7, 16GB RAM, 512GB SSD", Price = 69999, DiscountPrice = 64999, Stock = 20, ImageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", CategoryId = categories[0].Id, Rating = 4.6, ReviewCount = 89 },
            new() { Name = "Smart Watch", Brand = "Noise", Description = "Fitness tracker with heart rate monitor and GPS", Price = 4999, DiscountPrice = 3499, Stock = 100, ImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", CategoryId = categories[0].Id, Rating = 4.3, ReviewCount = 75 },
            new() { Name = "Classic Denim Jacket", Brand = "Levi's", Description = "Vintage-style denim jacket for men and women", Price = 2499, DiscountPrice = 1799, Stock = 40, ImageUrl = "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400", CategoryId = categories[1].Id, Rating = 4.2, ReviewCount = 56 },
            new() { Name = "Cotton T-Shirt Pack", Brand = "Jockey", Description = "Pack of 3 premium cotton t-shirts", Price = 999, DiscountPrice = 749, Stock = 200, ImageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", CategoryId = categories[1].Id, Rating = 4.1, ReviewCount = 200 },
            new() { Name = "Running Shoes", Brand = "Nike", Description = "Lightweight breathable running shoes with cushioning", Price = 3999, DiscountPrice = 2999, Stock = 60, ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", CategoryId = categories[1].Id, Rating = 4.4, ReviewCount = 145 },
            new() { Name = "The Clean Code Book", Brand = "Prentice Hall", Description = "A handbook of agile software craftsmanship", Price = 599, DiscountPrice = null, Stock = 80, ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", CategoryId = categories[2].Id, Rating = 4.8, ReviewCount = 500 },
            new() { Name = "Design Patterns Book", Brand = "Addison-Wesley", Description = "Elements of reusable object-oriented software", Price = 799, DiscountPrice = 649, Stock = 45, ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", CategoryId = categories[2].Id, Rating = 4.7, ReviewCount = 300 },
            new() { Name = "Non-Stick Cookware Set", Brand = "Prestige", Description = "10-piece non-stick cookware set with glass lids", Price = 4999, DiscountPrice = 3499, Stock = 25, ImageUrl = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400", CategoryId = categories[3].Id, Rating = 4.3, ReviewCount = 90 },
            new() { Name = "Coffee Maker", Brand = "Philips", Description = "Automatic drip coffee maker with 12-cup capacity", Price = 3499, DiscountPrice = 2799, Stock = 35, ImageUrl = "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400", CategoryId = categories[3].Id, Rating = 4.5, ReviewCount = 110 },
            new() { Name = "Yoga Mat Premium", Brand = "Boldfit", Description = "Extra thick non-slip yoga mat with carrying strap", Price = 1299, DiscountPrice = 899, Stock = 150, ImageUrl = "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400", CategoryId = categories[4].Id, Rating = 4.4, ReviewCount = 180 },
            new() { Name = "Dumbbell Set 20kg", Brand = "AmazonBasics", Description = "Adjustable dumbbell set with connecting rod", Price = 2999, DiscountPrice = 2499, Stock = 40, ImageUrl = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", CategoryId = categories[4].Id, Rating = 4.2, ReviewCount = 65 },
            new() { Name = "Tablet 11-inch", Brand = "Apple", Description = "11-inch tablet with Retina display and A15 chip", Price = 44999, DiscountPrice = 39999, Stock = 15, ImageUrl = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", CategoryId = categories[0].Id, Rating = 4.6, ReviewCount = 95 },
            new() { Name = "Formal Shirt", Brand = "Van Heusen", Description = "Slim-fit formal shirt for office wear", Price = 1499, DiscountPrice = 999, Stock = 80, ImageUrl = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", CategoryId = categories[1].Id, Rating = 4.0, ReviewCount = 45 },
            new() { Name = "Dairy Milk Chocolate", Brand = "Cadbury", Description = "Smooth, creamy milk chocolate made with the classic Glass and a Half of milk. 55g bar.", Price = 50, DiscountPrice = 45, Stock = 100, ImageUrl = "/products/dairy-milk.jpg", CategoryId = categories[5].Id, Rating = 4.6, ReviewCount = 320 },
            new() { Name = "Original Sandwich Cookies", Brand = "Oreo", Description = "Crunchy chocolate biscuits with a rich vanilla creme filling. Pack of 120g.", Price = 40, DiscountPrice = 35, Stock = 120, ImageUrl = "/products/oreo.jpg", CategoryId = categories[5].Id, Rating = 4.5, ReviewCount = 280 },
            new() { Name = "Classic Salted Potato Chips", Brand = "Lay's", Description = "Thin, crispy potato chips with just the right amount of salt. 52g pack.", Price = 30, DiscountPrice = 25, Stock = 150, ImageUrl = "/products/lays.jpg", CategoryId = categories[5].Id, Rating = 4.4, ReviewCount = 410 },
            new() { Name = "2-Minute Masala Noodles", Brand = "Nestle Maggi", Description = "India's favourite instant noodles with the iconic masala tastemaker. 70g pack.", Price = 15, DiscountPrice = 14, Stock = 200, ImageUrl = "/products/maggi.jpg", CategoryId = categories[5].Id, Rating = 4.7, ReviewCount = 900 },
            new() { Name = "Soft Drink 750ml", Brand = "Coca-Cola", Description = "Chilled, fizzy cola refreshment in a sharing-size bottle. 750ml.", Price = 45, DiscountPrice = 40, Stock = 90, ImageUrl = "/products/coke.jpg", CategoryId = categories[5].Id, Rating = 4.3, ReviewCount = 150 },
            new() { Name = "Aloo Bhujia", Brand = "Haldiram's", Description = "Crisp and spicy potato bhujia, a classic Indian tea-time snack. 200g pack.", Price = 60, DiscountPrice = 55, Stock = 80, ImageUrl = "/products/bhujia.jpg", CategoryId = categories[5].Id, Rating = 4.5, ReviewCount = 210 }
        };
        
        db.Products.AddRange(products);
        await db.SaveChangesAsync();
    }
}
