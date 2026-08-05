# Mini E-Commerce Platform

Full-stack mini e-commerce platform built with React 19, TypeScript, Express, and PostgreSQL. The application includes cookie-based authentication, a product catalog, product details, cart management, wishlist management, and order confirmation flows.

## Features

- `HttpOnly` cookie-based authentication with access and refresh sessions
- Product catalog with detailed product pages, variants, and image galleries
- Cart flows for adding items, changing variants, updating quantities, and checkout
- Wishlist flows for saving products and moving them into the cart
- Order confirmation view backed by persisted order snapshots
- Responsive frontend built with feature-based modules and Redux Toolkit state management
- PostgreSQL schema managed through ordered SQL migrations
- Docker-based run path and standard local npm development path

## Getting Started

There are two supported ways to run the project.

### Option 1: Docker

This is the fastest way to run the backend with PostgreSQL.

1. Start Docker Desktop.
2. From the project root, run:

```bash
docker compose up --build
```

3. The API will be available at `http://localhost:3000/api`.
4. Run the frontend separately in another terminal:

```bash
cd frontend
npm install
npm run dev
```

5. Open the app at `http://localhost:5173`.

Docker Compose provisions:

- PostgreSQL on `localhost:5432`
- the backend API on `localhost:3000`

### Option 2: Local npm setup

This path runs PostgreSQL locally and starts the frontend and backend directly from npm scripts.

1. Install PostgreSQL locally and make sure it is running.
2. Create a `.env` file inside `backend/` with at least:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mini_ecommerce_platform
PORT=3000
FRONTEND_URL=http://localhost:5173
ACCESS_TOKEN_COOKIE_NAME=mini_ecommerce_access
REFRESH_TOKEN_COOKIE_NAME=mini_ecommerce_refresh
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=30
COOKIE_SECURE=false
```

3. Install dependencies:

```bash
npm install
npm run install:all
```

4. Run database migrations:

```bash
cd backend
npm install
npm run db:migrate
```

5. Start the backend:

```bash
cd backend
npm run dev
```

6. Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

7. Open the app at `http://localhost:5173`.

Notes for the local path:

- the frontend uses `http://localhost:3000/api` by default, so `VITE_API_URL` is optional unless you want a different backend URL
- I verified the standard build locally with `npm.cmd run build`

## Demo Account

After running the migrations, you can sign in with the seeded demo user:

- Email: `customer@email.com`
- Password: `Customer#2026`

## User Flow Guides

### Login Guide

![Login Guide](docs/assets/login-guide.gif)

### Cart Guide

![Cart Guide](docs/assets/cart-guide.gif)

### Wishlist Guide

![Wishlist Guide](docs/assets/wishlist-guide.gif)

### Order Guide

![Order Guide](docs/assets/order-guide.gif)

## Database Diagram

![Database Diagram](docs/assets/database-diagram.svg)

## Documentation

The submission documents are:

- [Architecture](docs/ARCHITECTURE.md)
- [Backend Architecture](docs/BACKEND_ARCHITECTURE.md)
- [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md)
- [Database Architecture](docs/DATABASE_ARCHITECTURE.md)
- [AI Usage](docs/AI_USAGE.md)

## Verification

Available project scripts:

```bash
npm run lint
npm run test
npm run build
npm run check
```
