# clothing-ecommerce-microservices

## Project Overview
This repository is a simple monorepo for a clothing eCommerce platform built with Node.js + Express and a microservices architecture. Each service runs independently with its own Express server and MongoDB connection (separate DB names per service).

## Services
1. `api-gateway` (port `8000`)
2. `user-service` (port `3001`)
3. `product-service` (port `3002`)
4. `cart-service` (port `3003`)
5. `order-service` (port `3004`)
6. `inventory-service` (port `3005`)
7. `review-service` (port `3006`)

## Prerequisites
- Node.js (LTS)
- MongoDB running locally at `mongodb://localhost:27017`

## Install
From the repo root:
```bash
npm install
```

## Run Each Service
Start each service in its own terminal:

```bash
npm --workspace user-service start
npm --workspace product-service start
npm --workspace cart-service start
npm --workspace order-service start
npm --workspace inventory-service start
npm --workspace review-service start
```

Start the API Gateway:
```bash
npm --workspace api-gateway start
```

## API Gateway Usage
The gateway routes requests to the corresponding microservice. Example health checks:

- `GET http://localhost:8000/api/users/health` → `user-service` on `3001`
- `GET http://localhost:8000/api/products/health` → `product-service` on `3002`
- `GET http://localhost:8000/api/cart/health` → `cart-service` on `3003`
- `GET http://localhost:8000/api/orders/health` → `order-service` on `3004`
- `GET http://localhost:8000/api/inventory/health` → `inventory-service` on `3005`
- `GET http://localhost:8000/api/reviews/health` → `review-service` on `3006`

Cart REST endpoints are under `/api/cart` (direct: `http://localhost:3003/api/cart/...`, via gateway: `http://localhost:8000/api/cart/...`). Review REST endpoints are under `/api/reviews` (direct: `http://localhost:3006/api/reviews/...`, via gateway: `http://localhost:8000/api/reviews/...`).

Each service also exposes a standalone health check at `GET http://localhost:<service-port>/health`.