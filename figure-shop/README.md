# Figure Shop

Figure Shop is a graduation project for a collectible figure e-commerce website.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- JWT authentication with httpOnly cookie
- bcryptjs
- Zod

## Features

- Product listing and product detail
- Pre-order listing
- Cart
- Checkout and order creation
- Demo payment
- Customer order history
- Admin dashboard
- Admin order and product overview

## Getting Started

Install dependencies:

```bash
npm install
```

Create environment file:
cp .env.example .env

Run Prisma migration:
npx prisma migrate dev

Seed database:
npm run seed

Start dev server:
npm run dev

Open:
http://localhost:3000
Test Account

Email: admin@example.com
Password: 123456

If this user is not admin, update the role to ADMIN in the local database.

Scripts
npm run dev
npm run lint
npm run seed
npm run build

Notes
Project notes are stored in:
docs/notes.md

Sau đó chạy:

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
```
