# ShopNet — Full-Stack E-Commerce Platform

A complete e-commerce application built with **ASP.NET Core 10 Web API**, **Entity Framework Core**, **SQLite**, **JWT authentication**, and a **React 19 + Vite** storefront.

The project demonstrates a layered REST API, role-based authorization, relational data modelling, cart and order workflows, product reviews, and an admin dashboard.

---

## Highlights

- **ASP.NET Core Web API** with controllers, DTOs, services, and EF Core
- **JWT authentication** with password hashing (BCrypt) and `Customer` / `Admin` roles
- **Product catalogue** with search, category and brand filtering, price filters, sorting, and pagination
- **Shopping cart** with stock validation and per-user isolation
- **Checkout and orders** with UPI, card, cash-on-delivery, and wallet options, order history, cancellation with wallet refunds, stock deduction, and payment status
- **Product reviews** with automatic rating recalculation
- **Admin area** for dashboard stats, orders, products, categories, and users
- **Swagger UI** for exploring and testing every endpoint
- **Responsive React storefront** with loading skeletons, empty states, and protected flows
- **SQLite database** created and seeded automatically on first run — no setup required

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | C# 13, ASP.NET Core 10, ASP.NET Core Web API |
| Data access | Entity Framework Core 9, SQLite |
| Auth | JWT Bearer, BCrypt.Net-Next |
| API docs | Swashbuckle / Swagger UI |
| Frontend | React 19, React Router 7, Axios, Vite 8 |
| Linting | Oxlint |
| Tooling | .NET 10 SDK, Node.js 20+ |

---

## Project Structure

```
ECommercePlatform/
├── ECommercePlatform.slnx          # Solution file (open in Visual Studio / dotnet CLI)
├── README.md
├── .gitignore
├── backend/                        # ASP.NET Core Web API
│   ├── Controllers/                # Auth, Products, Cart, Orders, Reviews, Admin
│   ├── Data/                       # AppDbContext + seed data
│   ├── DTOs/                       # Request/response contracts
│   ├── Models/                     # User, Product, Category, CartItem, Order, Review
│   ├── Services/                   # JWT token generation
│   ├── Properties/launchSettings.json
│   ├── appsettings.json
│   ├── Program.cs                  # DI, JWT, CORS, Swagger, DB bootstrap
│   └── ECommerce.API.csproj
└── frontend/                       # React single-page app
    ├── src/
    │   ├── api/                    # Axios client + API modules
    │   ├── components/             # Navbar, Footer, ProductCard, Icons, Loader
    │   ├── context/                # AuthContext, CartContext
    │   ├── pages/                  # Home, ProductDetail, Login, Register, Cart, Orders, Admin
    │   ├── App.jsx
    │   └── App.css
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

---

## Prerequisites

Install these before running the project:

- [.NET 10 SDK](https://dotnet.microsoft.com/download) — verify with `dotnet --version`
- [Node.js 20+](https://nodejs.org/) — verify with `node --version`
- npm (bundled with Node.js)
- Optional: Visual Studio 2022+ or VS Code, and a modern browser

No database server is required. SQLite stores data in `backend/ecommerce.db`, which is created automatically.

---

## How to Run

### 1. Start the backend API

Open a terminal:

```powershell
cd C:\Users\DELL\ECommercePlatform\backend
dotnet restore
dotnet run
```

The API starts at **http://localhost:5000**.

- Swagger UI: **http://localhost:5000/swagger**
- API base path: **http://localhost:5000/api**

On first run the app creates the SQLite database and seeds demo data (6 categories, 21 products, 2 users).

### 2. Start the frontend

Open a **second** terminal:

```powershell
cd C:\Users\DELL\ECommercePlatform\frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

> Keep both terminals running. The frontend calls `http://localhost:5000/api` by default.
> To use a different API URL, copy `.env.example` to `.env.local` and change `VITE_API_URL`.

### 3. Sign in

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@shop.com` | `Admin@123` |
| Customer | `john@test.com` | `John@123` |

You can also register a new customer account from the UI.

### Run with Visual Studio

1. Open `ECommercePlatform.slnx`.
2. Set `ECommerce.API` as the startup project.
3. Press **F5**. Swagger opens at the API root when the project is configured to launch a browser.
4. Start the frontend separately with `npm run dev` as shown above.

---

## Configuration

`backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=ecommerce.db"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharsLong!",
    "Issuer": "ECommerceAPI",
    "Audience": "ECommerceClient"
  }
}
```

- **JWT key** must be at least 32 characters for HMAC-SHA256. Replace the demo key before deploying.
- **Ports** are set in `backend/Properties/launchSettings.json` (HTTP profile: `http://localhost:5000`).
- **CORS** allows `http://localhost:5173` and `http://localhost:3000` in `Program.cs`.
- **Frontend API URL** is controlled by `VITE_API_URL`.

---

## API Reference

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create a customer account and return a JWT |
| POST | `/auth/login` | Public | Authenticate and return a JWT |

### Products

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/products` | Public | Paginated list with `search`, `categoryId`, `brand`, `minPrice`, `maxPrice`, `sortBy`, `page`, `pageSize` |
| GET | `/products/{id}` | Public | Product details |
| GET | `/products/categories` | Public | All categories |
| GET | `/products/brands` | Public | Distinct brands with product counts |
| GET | `/products/{id}/reviews` | Public | Reviews for a product |

`sortBy` accepts `price_asc`, `price_desc`, `rating`, or `newest`.

### Cart (requires a JWT)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/cart` | Current user's cart |
| POST | `/cart` | Add an item — body: `{ "productId": 1, "quantity": 2 }` |
| PUT | `/cart/{id}` | Update quantity — raw JSON number, e.g. `3` |
| DELETE | `/cart/{id}` | Remove an item |
| DELETE | `/cart/clear` | Empty the cart |

### Orders (requires a JWT)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/orders/place` | Checkout — body: `{ "shippingAddress": "...", "paymentMethod": "UPI" }` (`UPI`, `Card`, `Cash`, or `Wallet`) |
| GET | `/orders` | Current user's order history |
| GET | `/orders/{id}` | A single order |
| POST | `/orders/{id}/cancel` | Cancel a pending/confirmed order; prepaid amounts are refunded to the wallet |

### Wallet (requires a JWT)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/wallet` | Current wallet balance |

Paid amounts from cancelled orders are credited to the wallet automatically. The wallet can be used as a payment method at checkout.

### Reviews (requires a JWT)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/reviews/product/{productId}` | Add a review — body: `{ "rating": 5, "comment": "..." }` |

### Admin (requires the `Admin` role)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/dashboard` | Totals, revenue, pending orders, recent orders |
| GET | `/admin/orders` | All orders with customer details |
| PUT | `/admin/orders/{id}/status` | Update status — raw JSON string, e.g. `"Shipped"` |
| POST | `/admin/products` | Create a product |
| PUT | `/admin/products/{id}` | Update a product |
| DELETE | `/admin/products/{id}` | Soft-delete a product |
| POST | `/admin/categories` | Create a category |
| GET | `/admin/users` | List users |

Sample requests are available in [`backend/ECommerce.API.http`](backend/ECommerce.API.http) — open it in Visual Studio or VS Code with the REST Client extension.

---

## Database

- Provider: **SQLite**
- File: `backend/ecommerce.db`
- Schema creation: `db.Database.EnsureCreated()` in `Program.cs`
- Seeding: `backend/Data/SeedData.cs` runs once, when the `Users` table is empty

To reset all data:

```powershell
cd C:\Users\DELL\ECommercePlatform\backend
# Stop the API first
Remove-Item ecommerce.db, ecommerce.db-shm, ecommerce.db-wal -ErrorAction SilentlyContinue
dotnet run
```

The database is intentionally excluded from Git (see `.gitignore`).

---

## Build and Lint

```powershell
# Backend
dotnet build C:\Users\DELL\ECommercePlatform\backend\ECommerce.API.csproj

# Frontend
cd C:\Users\DELL\ECommercePlatform\frontend
npm run lint
npm run build
```

The production frontend bundle is emitted to `frontend/dist/`.

---

## Architecture Notes

- **Controllers → EF Core → SQLite** with DTOs keeping API contracts separate from entities.
- **JWT claims** carry the user id and role; `[Authorize]` and `[Authorize(Roles = "Admin")]` protect routes.
- **Passwords** are hashed with BCrypt and never returned by the API.
- **Stock** is validated when adding to the cart and again at checkout; successful checkout decrements stock and clears the cart.
- **Wallet refunds** are issued only for prepaid orders (UPI, card, or wallet). Cash-on-delivery orders are cancelled without a refund because no money was collected.
- **Cart and order queries** are scoped to the authenticated user id, preventing cross-user access.
- **Rating and ReviewCount** are recalculated from stored reviews after each new review.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `dotnet` is not recognized | Install the .NET 10 SDK and reopen the terminal |
| `npm` is not recognized | Install Node.js 20+ and reopen the terminal |
| Port 5000 already in use | Change `applicationUrl` in `launchSettings.json` and set `VITE_API_URL` to match |
| Frontend shows network errors | Confirm the API is running and CORS includes the frontend origin |
| `database is locked` | Stop all running API instances, then retry |
| Stale build output | Delete `backend/bin`, `backend/obj`, and `frontend/node_modules`, then restore again |

---

## Possible Next Steps

- Add xUnit integration tests for authentication, cart, and checkout flows
- Replace `EnsureCreated` with EF Core migrations for versioned schema changes
- Add refresh tokens, email verification, and password reset
- Integrate a real payment gateway (checkout currently simulates UPI/card payments) and real image storage
- Containerise the API and frontend with Docker
- Deploy the API and SPA to Azure App Service / Azure Static Web Apps

---

## License

This project is provided for learning and portfolio purposes.
