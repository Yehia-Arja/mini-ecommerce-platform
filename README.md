# Mini E-Commerce Platform

Full-stack mini e-commerce platform built with React 19, TypeScript, Express, and PostgreSQL.
It includes cookie-based authentication, a product catalog, cart and wishlist flows, and order confirmation backed by persisted order snapshots.

## Demo

### Login

![Login Guide](docs/assets/login-guide.gif)

### Cart

![Cart Guide](docs/assets/cart-guide.gif)

### Wishlist

![Wishlist Guide](docs/assets/wishlist-guide.gif)

### Checkout

![Order Guide](docs/assets/order-guide.gif)

## Features

- `HttpOnly` cookie-based authentication with access and refresh sessions
- Product catalog with detailed product pages, variants, and image galleries
- Cart flows for adding items, changing variants, updating quantities, and checkout
- Wishlist flows for saving products and moving them into the cart
- Order confirmation view backed by persisted order snapshots
- Responsive frontend built with feature-based modules and Redux Toolkit state management
- PostgreSQL schema managed through ordered SQL migrations
- Docker-based run path and standard local npm development path

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Redux Toolkit, React Router, Axios, Zod
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Tooling: Docker Compose, ESLint, Node test runner

## Architecture

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Backend Architecture](docs/BACKEND_ARCHITECTURE.md)
- [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md)
- [Database Architecture](docs/DATABASE_ARCHITECTURE.md)

### Database Diagram

![Database Diagram](docs/assets/database-diagram.svg)

## Getting Started

There are two supported ways to run the project:

- Docker: run PostgreSQL and the backend through Docker Compose, then start the frontend locally
- Local npm setup: run PostgreSQL locally, apply migrations, and start both apps with npm
### Prerequisites

- Node.js and npm
- PostgreSQL for the local npm path
- Docker Desktop for the Docker path

### Installation

Install project dependencies from the repository root:

```bash
npm install
npm run install:all
```

### Environment Variables

Create a `.env` file inside `backend/` with at least:

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

### Option 1: Run With Docker

This is the fastest way to run the backend with PostgreSQL:

```bash
docker compose up --build
```

Then start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

### Option 2: Run With Local npm

For the normal local npm path, make sure PostgreSQL is already running locally.

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

### Run Backend

Run migrations first:

```bash
cd backend
npm install
npm run db:migrate
```

Then start the backend:

```bash
cd backend
npm run dev
```

The frontend uses `http://localhost:3000/api` by default, so `VITE_API_URL` is optional unless you want a different backend URL.

### Demo Account

After running the migrations, you can sign in with the seeded demo user:

- Email: `customer@email.com`
- Password: `Customer#2026`

## API

Main API route groups:

- `/api/auth`
- `/api/products`
- `/api/cart`
- `/api/wishlist`
- `/api/orders`
- `/api/health`

## Project Structure

```text
mini-ecommerce-platform/
|-- backend/
|-- frontend/
|-- docs/
|-- Dockerfile
|-- docker-compose.yml
`-- package.json
```

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Backend Architecture](docs/BACKEND_ARCHITECTURE.md)
- [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md)
- [Database Architecture](docs/DATABASE_ARCHITECTURE.md)
- [AI Usage](docs/AI_USAGE.md)
