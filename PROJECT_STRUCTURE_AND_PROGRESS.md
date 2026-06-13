# Figure Shop - Project Structure And Progress

File nay la ban ghi nho chung cho do an. Moi khi lam viec voi code, doc file nay truoc de bam dung tech stack, structure, bao mat va thu tu trien khai da chot.

## 1. Muc Tieu Du An

Xay dung website thuong mai dien tu cho cua hang mo hinh suu tam, ho tro:

- Ban san pham co san.
- Dat truoc san pham pre-order.
- Gio hang va checkout.
- Quan ly don hang.
- Trang quan tri cho admin/staff.
- Xac thuc nguoi dung bang JWT.

## 2. Tech Stack Chot

```text
Framework: Next.js App Router
Language: TypeScript
UI: Tailwind CSS + shadcn/ui
Database local: SQLite
ORM: Prisma
Database viewer: SQLTools + SQLTools SQLite Driver
Authentication: JWT only
Password hashing: bcryptjs
Validation: Zod
Upload anh: Cloudinary hoac local truoc, Cloudinary sau
Payment: COD + chuyen khoan/demo payment truoc
Package manager: npm
Code editor: VSCode
Version control: Git + GitHub
```

Khong dung:

```text
PostgreSQL local
NextAuth/Auth.js
OAuth Google/Facebook
Session-based authentication
```

## 3. Bao Mat Chot

Chi dung JWT cho authentication.

```text
JWT duoc luu trong httpOnly cookie.
Mat khau duoc hash bang bcryptjs.
Middleware bao ve /account, /checkout, /admin.
Phan quyen bang role: CUSTOMER, STAFF, ADMIN.
```

Auth routes:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

JWT payload chi nen gom:

```ts
{
  userId: string;
  email: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
}
```

Khong dua vao JWT:

```text
passwordHash
phone
address
payment information
personal data khong can thiet
```

## 4. Structure Code Chot

```text
figure-shop/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── images/
│   └── logo.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   │
│   │   ├── (store)/
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── preorder/
│   │   │   │   └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── brands/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   └── checkout/
│   │   │       └── page.tsx
│   │   │
│   │   ├── account/
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── addresses/
│   │   │   │   └── page.tsx
│   │   │   └── wishlist/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── preorders/
│   │   │   │   └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   ├── brands/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── coupons/
│   │   │   │   └── page.tsx
│   │   │   └── reports/
│   │   │       └── page.tsx
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       ├── products/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── cart/
│   │       │   ├── route.ts
│   │       │   └── items/
│   │       │       ├── route.ts
│   │       │       └── [id]/route.ts
│   │       ├── orders/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── payment/
│   │       │   └── route.ts
│   │       ├── upload/
│   │       │   └── route.ts
│   │       └── admin/
│   │           ├── dashboard/route.ts
│   │           ├── products/route.ts
│   │           ├── orders/route.ts
│   │           ├── orders/[id]/route.ts
│   │           ├── orders/[id]/status/route.ts
│   │           └── reports/route.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AdminSidebar.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilter.tsx
│   │   │   ├── ProductPrice.tsx
│   │   │   └── PreorderInfo.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── order/
│   │   │   └── OrderStatusBadge.tsx
│   │   └── admin/
│   │       ├── ProductForm.tsx
│   │       ├── OrderStatusSelect.tsx
│   │       └── DashboardStats.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── jwt.ts
│   │   ├── auth.ts
│   │   ├── password.ts
│   │   ├── permissions.ts
│   │   ├── payment.ts
│   │   ├── upload.ts
│   │   └── utils.ts
│   │
│   ├── services/
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── preorder.service.ts
│   │   ├── payment.service.ts
│   │   └── user.service.ts
│   │
│   ├── validations/
│   │   ├── auth.schema.ts
│   │   ├── product.schema.ts
│   │   ├── order.schema.ts
│   │   ├── address.schema.ts
│   │   ├── review.schema.ts
│   │   └── coupon.schema.ts
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── cart.ts
│   │   └── payment.ts
│   │
│   └── middleware.ts
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## 5. Database Models Chot

```text
User
Product
ProductImage
Category
Brand
Series
Cart
CartItem
Order
OrderItem
Payment
Address
Review
Wishlist
Coupon
InventoryLog
```

## 6. Thu Tu Trien Khai

Danh dau trang thai bang:

```text
[ ] Chua lam
[~] Dang lam
[x] Da xong
```

Tien do hien tai:

```text
[x] 01. Tao project Next.js
[x] 02. Cai thu vien can thiet
[x] 03. Setup Prisma + SQLite
[x] 04. Tao schema User
[x] 05. Lam JWT auth
[x] 06. Lam layout co ban
[ ] 07. Lam Product, Category, Brand
[ ] 08. Lam trang danh sach va chi tiet san pham
[ ] 09. Lam cart
[ ] 10. Lam checkout va order
[ ] 11. Lam admin dashboard
[ ] 12. Lam preorder
[ ] 13. Lam payment demo
[ ] 14. Polish UI va chuan bi bao cao
```

## 7. Quy Tac Lam Viec

- Moi lan bat dau code, doc file nay truoc.
- Neu project nam trong `figure-shop/`, thao tac trong folder do.
- Khong them NextAuth, OAuth, session auth vi da chot JWT only.
- Khong doi SQLite sang PostgreSQL local.
- Khong day `.env`, `node_modules`, `.next`, `prisma/dev.db` len GitHub.
- Khi hoan thanh mot buoc, cap nhat tien do trong file nay.
