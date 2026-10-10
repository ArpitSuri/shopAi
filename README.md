# Shopfront – MERN E-commerce Platform

A full-stack e-commerce application built with the **MERN stack** (MongoDB, Express.js, React.js, and Node.js), featuring role-based authentication, OTP verification, product and category management, shopping cart, order processing, and an admin dashboard.

## Features

### Customer Features
- **Authentication & Authorization:** Signup, login, JWT authentication, and email-verification-style OTP flow.
- **OTP Verification:** Six-digit OTP verification with expiration, hashed storage, and attempt limits.
- **Product Catalog:** Browse products, search, filter by category, sort, and paginate results.
- **Shopping Cart:** Add products, update quantities, remove items, and clear the cart.
- **Order Management:** Place orders, view order details, and cancel eligible orders.
- **Order History:** Preserve product names, prices, and images in order snapshots.
- **Checkout:** Cash on delivery, with configurable shipping charges.

### Admin Features
- **Dashboard:** View store statistics.
- **Product Management:** Create, update, view, and delete products.
- **Category Management:** Manage categories and prevent deletion when products are associated with them.
- **Order Management:** View orders and update their status.
- **Role-Based Access:** Restrict administrative operations to authorized admin accounts.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js (ES modules) |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Validation | Zod |
| Security | Helmet, CORS, NoSQL injection sanitization, rate limiting |
| Development | npm, Nodemon |

## Project Structure

```text
Shopfront/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and application constants
│   │   ├── models/          # User, OTP, Category, Product, Cart, Order
│   │   ├── middlewares/     # Authentication, validation, rate limiting
│   │   ├── validators/      # Zod validation schemas
│   │   ├── services/        # OTP and cart business logic
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API route definitions
│   │   └── utils/           # Errors, tokens, pricing, OTP, slugify
│   ├── .env.example
│   ├── seed.js
│   └── server.js
└── frontend/
    └── src/                 # React application
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB running locally or a MongoDB Atlas connection URI
- Git (optional, for cloning the repository)

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Shopfront
```

Replace `<YOUR_REPOSITORY_URL>` with your Git repository URL.

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create your environment file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux**
```bash
cp .env.example .env
```

Update `backend/.env` with your local configuration:

```env
MONGO_URI=mongodb://127.0.0.1:27017/shopfront
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Use the actual variable names and any additional required settings defined in `.env.example`. The values above are illustrative; your MongoDB URI and application configuration may differ.

**Important:** Never commit `.env` or expose JWT secrets in your repository.

### 3. Seed the Database

```bash
npm run seed
```

This command creates the initial admin account and sample categories and products.

The demo admin credentials are:

```text
Email:    admin@shop.com
Password: Admin@123
```

Change the default password before using the application outside local development.

### 4. Start the Backend

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

Keep this terminal running.

### 5. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

The Vite development server proxies `/api` requests to the backend on port `5000`.

## Authentication and OTP Flow

1. **Signup:** `POST /api/auth/signup` creates an unverified customer account and generates a six-digit OTP.
2. **OTP Verification:** `POST /api/auth/verify-otp` verifies the OTP and returns a JWT upon success.
3. **Login:** `POST /api/auth/login` authenticates the user. Unverified users are redirected to verification.
4. **Resend OTP:** `POST /api/auth/resend-otp` generates a replacement OTP, subject to rate limits.
5. **Current User:** `GET /api/auth/me` returns the authenticated user's information.

### Demo OTP Mode

Email delivery has been removed from the current implementation. In development mode, the OTP is printed in the backend console and displayed on the verification page.

Demo OTP exposure is automatically disabled when `NODE_ENV=production`.

To enable real OTP delivery, integrate an email provider in:

```text
backend/src/services/otp.service.js
```

Do not expose OTP values in production responses or frontend interfaces.

## API Documentation

All endpoints are prefixed with `/api`, unless otherwise noted.

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/signup` | Public |
| POST | `/auth/verify-otp` | Public |
| POST | `/auth/resend-otp` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Authenticated |

### Categories

| Method | Endpoint | Access |
|---|---|---|
| GET | `/categories` | Public |
| GET | `/categories/:id` | Public |
| GET | `/categories/admin/all` | Admin |
| POST | `/categories` | Admin |
| PUT | `/categories/:id` | Admin |
| DELETE | `/categories/:id` | Admin |

### Products

| Method | Endpoint | Access |
|---|---|---|
| GET | `/products` | Public |
| GET | `/products/:id` | Public |
| GET | `/products/admin/all` | Admin |
| POST | `/products` | Admin |
| PUT | `/products/:id` | Admin |
| DELETE | `/products/:id` | Admin |

Product listing supports query parameters:

```text
GET /api/products?search=phone&category=<categoryId>&sort=price_asc&page=1&limit=10
```

Supported filters include search, category, sorting, page number, and page size. Actual sort values depend on the backend implementation.

### Cart

| Method | Endpoint | Access |
|---|---|---|
| GET | `/cart` | Customer |
| POST | `/cart` | Customer |
| PUT | `/cart/items/:productId` | Customer |
| DELETE | `/cart/items/:productId` | Customer |
| DELETE | `/cart` | Customer |

Example request body for adding a product:

```json
{
  "productId": "PRODUCT_ID",
  "quantity": 2
}
```

### Orders

| Method | Endpoint | Access |
|---|---|---|
| POST | `/orders` | Customer |
| GET | `/orders/my` | Customer |
| GET | `/orders/:id` | Owner or Admin |
| PATCH | `/orders/:id/cancel` | Customer |
| GET | `/orders?status=pending` | Admin |
| PATCH | `/orders/:id/status` | Admin |

### Admin Dashboard

| Method | Endpoint | Access |
|---|---|---|
| GET | `/admin/stats` | Admin |

**Authorization:** Customer endpoints require a valid JWT. Administrative endpoints additionally require the admin role.

## Business Rules

- **Shipping:** ₹49 per order; free shipping for orders of ₹999 or more.
- **Payment:** Cash on delivery.
- **Inventory:** Stock is reserved atomically during checkout and restored when an eligible order is cancelled.
- **Customer cancellation:** Customers can cancel only pending orders.
- **Admin order workflow:** Pending → Confirmed → Shipped → Delivered.
- **Cancellation restrictions:** Admin cancellation is permitted before shipping, according to the order rules.
- **Order snapshots:** Orders preserve product names, prices, and images at purchase time.
- **Category deletion:** Categories cannot be deleted while products reference them.
- **Role assignment:** Public signup always creates a customer account. Admin access is provisioned through database seeding or controlled database administration.

## Security Measures

- JWT-based authentication and role-based authorization.
- Password hashing with bcrypt using 12 salt rounds.
- Hashed OTP storage, expiration, and a maximum of five verification attempts.
- Global and endpoint-specific rate limiting.
- Helmet security headers.
- CORS restricted to the configured `CLIENT_URL`.
- Request body size limits.
- NoSQL injection sanitization.
- Zod-based request validation.
- Centralized error handling.

## Available Scripts

Run these commands from the `backend` directory:

| Command | Purpose |
|---|---|
| `npm install` | Install backend dependencies |
| `npm run seed` | Seed the admin account and sample data |
| `npm run dev` | Start the development server |

Run `npm install` and `npm run dev` from the `frontend` directory to install and start the React development server.

## Future Improvements

- Integrate a real email service for OTP delivery.
- Add automated backend and frontend tests.
- Introduce payment gateway integration.
- Add Docker-based deployment.
- Implement product image uploads and order notifications.
- Add API documentation using Swagger/OpenAPI.

## License

Add your preferred license before distributing or publishing the project.

---

**Shopfront** — A MERN-based e-commerce starter designed to demonstrate authentication, catalog management, inventory handling, order processing, and administrative workflows.
