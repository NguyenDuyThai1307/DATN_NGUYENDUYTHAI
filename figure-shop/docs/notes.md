# Figure Shop Notes

## Technical Decisions

- The project uses Next.js App Router as a full-stack framework.
- API routes are implemented in `src/app/api`.
- Authentication uses JWT stored in an httpOnly cookie.
- Passwords are hashed with bcryptjs.
- Local database uses SQLite with Prisma.
- Payment currently supports COD, bank transfer placeholder, and demo payment.
- VNPay or another real payment gateway can be added after the core graduation project flow is complete.

## Current Core Flows

- Register, login, logout, and get current user.
- Product listing and product detail.
- Pre-order listing.
- Cart add, update, remove, and view.
- Checkout creates an order from cart.
- Demo payment marks demo orders as paid.
- Customer can view order history and order detail.
- Admin can view dashboard, products, pre-orders, orders, and order detail.

## Later Improvements

- Add real product images.
- Add product create/edit forms in admin.
- Add order status update controls for staff/admin.
- Add VNPay sandbox integration.
- Add search, categories, and brand pages.
- Polish Vietnamese copy with accents.
- Improve responsive layout and empty states.
