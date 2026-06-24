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
Backend/Client split neu chua that su can
```

## 3. Bao Mat Chot

Chi dung JWT cho authentication.

```text
JWT duoc luu trong httpOnly cookie.
Mat khau duoc hash bang bcryptjs.
Proxy bao ve /account, /cart, /checkout, /admin.
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

Du an giu huong Next.js full-stack. Khong tach rieng `Backend/` va `Client/` nhu mot so project khac.

```text
figure-shop/
|-- prisma/
|   |-- schema.prisma
|   |-- seed.ts
|   `-- migrations/
|
|-- public/
|   `-- images/
|       `-- products/
|
|-- src/
|   |-- app/
|   |   |-- (store)/
|   |   |   |-- products/
|   |   |   |   |-- page.tsx
|   |   |   |   `-- [slug]/
|   |   |   |       `-- page.tsx
|   |   |   |-- preorder/
|   |   |   |   `-- page.tsx
|   |   |   |-- categories/
|   |   |   |   `-- [slug]/
|   |   |   |       `-- page.tsx
|   |   |   |-- brands/
|   |   |   |   `-- [slug]/
|   |   |   |       `-- page.tsx
|   |   |   |-- search/
|   |   |   |   `-- page.tsx
|   |   |   |-- cart/
|   |   |   |   `-- page.tsx
|   |   |   `-- checkout/
|   |   |       `-- page.tsx
|   |   |
|   |   |-- account/
|   |   |   |-- page.tsx
|   |   |   |-- profile/
|   |   |   |-- orders/
|   |   |   |-- addresses/
|   |   |   `-- wishlist/
|   |   |
|   |   |-- admin/
|   |   |   |-- layout.tsx
|   |   |   |-- page.tsx
|   |   |   |-- products/
|   |   |   |-- orders/
|   |   |   |-- preorders/
|   |   |   |-- categories/
|   |   |   |-- brands/
|   |   |   |-- users/
|   |   |   |-- coupons/
|   |   |   `-- reports/
|   |   |
|   |   |-- login/
|   |   |   `-- page.tsx
|   |   |-- register/
|   |   |   `-- page.tsx
|   |   |
|   |   |-- api/
|   |   |   |-- auth/
|   |   |   |   |-- login/route.ts
|   |   |   |   |-- register/route.ts
|   |   |   |   |-- logout/route.ts
|   |   |   |   `-- me/route.ts
|   |   |   |-- cart/
|   |   |   |   |-- route.ts
|   |   |   |   `-- items/
|   |   |   |       |-- route.ts
|   |   |   |       `-- [id]/route.ts
|   |   |   |-- products/
|   |   |   |-- orders/
|   |   |   |-- payment/
|   |   |   |-- upload/
|   |   |   `-- admin/
|   |   |
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   |-- globals.css
|   |   `-- favicon.ico
|   |
|   |-- components/
|   |   |-- ui/
|   |   |-- layout/
|   |   |   |-- Header.tsx
|   |   |   |-- Footer.tsx
|   |   |   `-- AdminSidebar.tsx
|   |   |-- product/
|   |   |   |-- ProductCard.tsx
|   |   |   |-- ProductGrid.tsx
|   |   |   |-- ProductFilter.tsx
|   |   |   |-- ProductPrice.tsx
|   |   |   `-- PreorderInfo.tsx
|   |   |-- cart/
|   |   |   |-- CartItem.tsx
|   |   |   `-- CartSummary.tsx
|   |   |-- checkout/
|   |   |   |-- CheckoutForm.tsx
|   |   |   `-- OrderSummary.tsx
|   |   |-- order/
|   |   |   `-- OrderStatusBadge.tsx
|   |   `-- admin/
|   |       |-- ProductForm.tsx
|   |       |-- OrderStatusSelect.tsx
|   |       `-- DashboardStats.tsx
|   |
|   |-- constants/
|   |   `-- auth.ts
|   |
|   |-- hooks/
|   |
|   |-- lib/
|   |   |-- prisma.ts
|   |   |-- jwt.ts
|   |   |-- auth.ts
|   |   |-- password.ts
|   |   |-- permissions.ts
|   |   |-- payment.ts
|   |   |-- upload.ts
|   |   `-- utils.ts
|   |
|   |-- services/
|   |   |-- product.service.ts
|   |   |-- cart.service.ts
|   |   |-- order.service.ts
|   |   |-- preorder.service.ts
|   |   |-- payment.service.ts
|   |   `-- user.service.ts
|   |
|   |-- validations/
|   |   |-- auth.schema.ts
|   |   |-- cart.schema.ts
|   |   |-- product.schema.ts
|   |   |-- order.schema.ts
|   |   |-- address.schema.ts
|   |   |-- review.schema.ts
|   |   `-- coupon.schema.ts
|   |
|   |-- types/
|   |   |-- user.ts
|   |   |-- product.ts
|   |   |-- order.ts
|   |   |-- cart.ts
|   |   `-- payment.ts
|   |
|   `-- proxy.ts
|
|-- docs/
|   `-- notes.md
|
|-- .env
|-- .env.example
|-- .gitignore
|-- package.json
|-- next.config.ts
|-- prisma.config.ts
|-- tsconfig.json
`-- README.md
```

Ghi chu structure:

```text
API backend nam trong src/app/api.
src/constants/ chua hang so dung chung, vi du ten auth cookie.
src/hooks/ de danh cho client hooks khi can UI tuong tac.
docs/ de ghi chu do an, quyet dinh ky thuat, tai lieu trien khai.
Khong them React Query, i18n, jobs, plugins neu chua that su can.
Dung src/proxy.ts thay cho middleware.ts theo convention Next.js moi.
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
[x] 07. Lam Product, Category, Brand
[x] 08. Lam trang danh sach va chi tiet san pham
[x] 09. Lam cart
[x] 10. Lam checkout va order
[x] 11. Lam admin dashboard
[x] 12. Lam preorder
[x] 13. Lam payment demo
[x] 14. Polish UI va chuan bi bao cao
```

## 7. Quy Tac Lam Viec

- Moi lan bat dau code, doc file nay truoc.
- Neu project nam trong `figure-shop/`, thao tac trong folder do.
- Khong them NextAuth, OAuth, session auth vi da chot JWT only.
- Khong doi SQLite sang PostgreSQL local.
- Khong tach rieng `Backend/` va `Client/` neu chua co ly do bat buoc.
- Khong day `.env`, `node_modules`, `.next`, `dev.db`, `dev.db-journal`, `prisma/dev.db` len GitHub.
- Khi hoan thanh mot buoc, cap nhat tien do trong file nay.
- Truoc khi commit nen chay `npm.cmd exec tsc -- --noEmit` va `npm.cmd run lint` trong `figure-shop/`.

## 8. Ke Hoach Cai Thien Sau MVP

Muc tieu: nang website tu khung chuc nang co ban thanh san pham dep hon, de dung hon, de bao tri hon va co them logic quan trong cho do an.

### 8.1. UI / UX

```text
[x] Tao UI primitives co ban: Button, Input, Textarea, Select, Badge
[x] Refactor CheckoutForm dung UI primitives
[x] Refactor LoginForm dung UI primitives
[x] Refactor ProductCard dung Badge
[x] Tach CartItem va CartSummary
[x] Tao OrderStatusBadge va PaymentStatusBadge
[ ] Them anh that/placeholder dep cho san pham trong public/images/products
[ ] Nang cap trang chu: hero banner, san pham moi, preorder hot, brand noi bat
[ ] Nang cap product detail: gallery anh, thong so, chinh sach preorder, CTA ro hon
[ ] Them mobile navbar/menu
[ ] Cai thien footer voi thong tin lien he, chinh sach, lien ket nhanh
```

### 8.2. Frontend / Component Structure

```text
[ ] Tao ProductGrid
[ ] Tao ProductGallery
[x] Tao ProductFilter
[x] Tao ProductSort
[x] Tao CartQuantityControl
[ ] Tao OrderSummary dung chung cho cart/checkout/order
[ ] Tao status badges cho product/preorder neu can
[ ] Giam code lap lai trong cac page admin/order/cart
[ ] Them loading, empty state, error state dong bo
```

### 8.3. Cart Va Checkout UX

```text
[x] Them nut tang/giam so luong trong gio hang
[x] Them nut xoa san pham khoi gio hang tren UI
[x] Hien thi tam tinh, giam gia, phi ship, tong thanh toan ro rang
[ ] Cai thien validation checkout: field-level error
[ ] Tao trang order success sau khi checkout
[x] Dam bao checkout khong tin gia tu client, server tu tinh lai gia
```

### 8.4. Admin Quan Ly San Pham

Chuc nang can co:

```text
[x] Xem danh sach san pham dang co
[x] Them san pham
[x] Sua san pham
[x] Xoa mem/Archive san pham
[x] Quan ly danh muc: danh sach, them, sua
[x] Quan ly thuong hieu: danh sach, them, sua
[ ] Quan ly anh san pham
[ ] Loc/tim san pham theo ten, brand, category, status, type
```

Truong san pham nen quan ly:

```text
name
slug
description
price
salePrice hoac compareAtPrice neu lam khuyen mai truc tiep
categoryId
brandId
seriesId neu them Series sau nay
stock
images
status: ACTIVE / DRAFT / ARCHIVED
type: IN_STOCK / PREORDER
```

File/component/service can them hoac sua:

```text
src/validations/product.schema.ts
src/components/admin/ProductForm.tsx
src/components/admin/ProductTable.tsx
src/components/admin/DeleteProductDialog.tsx
src/services/admin-product.service.ts
src/app/admin/products/page.tsx
src/app/admin/products/create/page.tsx
src/app/admin/products/[id]/edit/page.tsx
src/app/api/admin/products/route.ts
src/app/api/admin/products/[id]/route.ts
```

### 8.5. Logic Khuyen Mai

````text
[x] Them pricing.service.ts de tinh gia tap trung
[x] Ho tro gia goc, gia sau giam, phan tram giam
[x] Promotion theo san pham: admin tao, sua, tat, co thoi gian ap dung
[ ] Promotion theo category/brand
[x] Coupon: admin tao, sua, tat
[x] Coupon: ap dung/go ma tai gio hang va hien thi o checkout
[x] Coupon: server kiem tra lai khi tao order va cap nhat usedCount
[x] Luu snapshot promotion/coupon vao Order va OrderItem

### 8.6. Thanh Toan That Sau Nay

```text
[ ] Giu payment demo cho bao cao hien tai
[ ] Sau khi khung do an on dinh moi tich hop VNPay sandbox
[ ] Neu them VNPay: them PaymentMethod VNPAY, env VNPAY_*, helper ky/verify, route create/return
[ ] Secret thanh toan chi nam trong .env, khong dua ra client
````

### 8.7. Uu Tien Lan Lam Tiep Theo

```text
1. Cart quantity controls
2. Admin Product CRUD
3. Product filter/sort/search
4. Pricing service
5. Promotion/Coupon
6. UI polish va anh san pham
7. Chuan bi bao cao/screenshot/seed demo
```
