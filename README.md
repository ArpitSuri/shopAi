# Shopfront – MERN e-commerce starter

Express + MongoDB (ESM) backend and React + Tailwind frontend.

## Run it

**Requirements:** Node 18+, MongoDB running locally (or an Atlas URI).

```bash
# 1) Backend
cd backend
cp .env.example .env        # set MONGO_URI and JWT_SECRET
npm install
npm run seed                # creates the admin + sample categories/products
npm run dev                 # http://localhost:5000

# 2) Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173  (proxies /api to :5000)
```

> **Important:** `.env.example` is only a template. You must create a real `backend/.env` (`cp .env.example .env`),
> otherwise the server stops and tells you which variables are missing. Env vars are read directly via `process.env`
> (`dotenv` is loaded once at the top of `server.js` and `seed.js`).

Admin login (from `.env`): `admin@shop.com` / `Admin@123`

**OTP:** email sending is removed. The OTP is printed in the backend console and shown on the verify page (demo mode,
automatically off when `NODE_ENV=production`). To deliver it for real later, send it from `backend/src/services/otp.service.js`.

## How roles work

- Signup always creates a `user`. The only way to get an `admin` is `npm run seed` (or editing the DB).
- Backend: `protect` (JWT) + `authorize('admin')` / `authorize('user')` on each route.
- Frontend: `ProtectedRoute roles={[...]}` guards pages; admins hitting the shop are redirected to `/admin`,
  customers hitting `/admin` are redirected to `/`.

## Auth + OTP flow

1. `POST /auth/signup` → creates unverified user, generates a 6-digit OTP (stored hashed, expires, max 5 attempts)
2. `POST /auth/verify-otp` → marks verified and returns a JWT
3. `POST /auth/login` → unverified accounts are sent to the verify page, where a fresh OTP can be generated

## API

| Area | Endpoint | Access |
|---|---|---|
| Auth | `POST /api/auth/signup`, `verify-otp`, `resend-otp`, `login`; `GET /me` | public / logged in |
| Categories | `GET /api/categories`, `GET /:id` | public |
| | `GET /admin/all`, `POST /`, `PUT /:id`, `DELETE /:id` | admin |
| Products | `GET /api/products?search=&category=&sort=&page=&limit=`, `GET /:id` | public |
| | `GET /admin/all`, `POST /`, `PUT /:id`, `DELETE /:id` | admin |
| Cart | `GET /api/cart`, `POST /` `{productId, quantity}`, `PUT /items/:productId`, `DELETE /items/:productId`, `DELETE /` | user |
| Orders | `POST /api/orders`, `GET /my`, `PATCH /:id/cancel` | user |
| | `GET /api/orders?status=`, `PATCH /:id/status` | admin |
| | `GET /api/orders/:id` | owner or admin |
| Admin | `GET /api/admin/stats` | admin |

## Backend structure

```
src/
  config/        db, constants
  models/        User, Otp, Category, Product, Cart, Order
  middlewares/   auth (protect/authorize), rateLimiter, validate, errorHandler
  validators/    zod schemas per module
  services/      otp, cart
  controllers/   auth, category, product, cart, order, admin
  routes/        one router per module + index
  utils/         ApiError, asyncHandler, token, otp, pricing, slugify
```

Security: helmet, CORS (restricted to `CLIENT_URL`), body size limit, NoSQL-injection sanitizing,
bcrypt (12 rounds), global + per-route rate limits (login/signup, OTP verify, OTP resend).

## Business rules

- Stock is reserved atomically at checkout and returned if the order is cancelled.
- Users can cancel only `pending` orders. Admin status flow: pending → confirmed → shipped → delivered (cancel allowed before shipping).
- Orders store a snapshot of name/price/image, so later product edits or deletes don't change history.
- Shipping: ₹49, free from ₹999 (`backend/src/config/constants.js`). Payment: cash on delivery.
- Deleting a category is blocked while it still has products.
