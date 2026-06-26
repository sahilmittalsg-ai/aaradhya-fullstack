# Backend API

Base URL:

```text
http://localhost:5000/api
```

## Environment

Create `server/.env` from `server/.env.example`.

```text
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=change-this-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=40
PASSWORD_RESET_TTL_MINUTES=15
```

## Database Collections

The API stores each collection as JSONB documents inside PostgreSQL table `app_documents`.

- `users`: admin/client accounts, addresses, wishlist
- `products`: catalog, pricing, stock, images, tags, benefits, materials
- `categories`: storefront menu and filters
- `orders`: checkout orders, shipping address, payment and shipment status
- `paymentmethods`: checkout payment choices and provider metadata
- `coupons`: flat/percent discounts
- `reviews`: product reviews and ratings
- `supporttickets`: client support messages and admin replies
- `sitesettings`: brand, navigation, support, announcement, footer settings
- `banners`: hero, collection, and promo banners
- `homesections`: homepage content blocks
- `pages`: policy/about/support CMS pages
- `newslettersubscribers`: footer/newsletter signups

See `server/DATABASE.md` for the full database plan.

## Storefront Content

```http
GET /content/storefront
GET /content/pages/:slug
POST /content/newsletter
```

Seeded site-option pages:

```text
/pages/about-us
/pages/bulk-wholesale
/pages/contact-us
/pages/marketplace-store
/pages/returns-exchange
/pages/refund-return-policy
/pages/shipping-policy
/pages/privacy-policy
/pages/terms-of-service
/pages/cashback-policy
/pages/cancellation-policy
```

Admin content APIs:

```http
GET /content/admin/banners
POST /content/admin/banners
PATCH /content/admin/banners/:id

GET /content/admin/home-sections
POST /content/admin/home-sections
PATCH /content/admin/home-sections/:id

GET /content/admin/pages
POST /content/admin/pages
PATCH /content/admin/pages/:id

GET /content/admin/settings
PATCH /content/admin/settings

GET /content/admin/newsletter
```

## Auth

```http
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/otp/request
POST /auth/otp/verify
```

Login body:

```json
{
  "email": "admin@demo.com",
  "password": "admin123"
}
```

Use the returned access token. For backward compatibility, auth responses include both `accessToken` and `token` with the same value.

```http
Authorization: Bearer <token>
```

Refresh body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Forgot password body:

```json
{
  "email": "client@demo.com"
}
```

Reset password body:

```json
{
  "token": "<reset-token>",
  "password": "new-password"
}
```

OTP request body:

```json
{
  "phone": "8888888888"
}
```

OTP verify body:

```json
{
  "phone": "8888888888",
  "code": "123456",
  "name": "Client User"
}
```

Development OTP is `123456`. If Twilio values are missing, the API automatically uses development OTP mode. Verifying OTP logs in the customer, creates a client account when the mobile number is new, and stores `phoneVerifiedAt` on the user.

Optional environment values:

```text
OTP_TTL_MINUTES=5
OTP_DEV_CODE=123456
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

## Products

```http
GET /products
GET /products/:slug
POST /products              admin
PATCH /products/:id         admin
DELETE /products/:id        admin archive
```

Product list query options:

```text
search, category, collection, purpose, bead, mukhi, plating, audience
featured=true
inStock=true
minPrice=500
maxPrice=1500
sort=featured|newest|price-asc|price-desc|rating|stock
page=1
limit=12
```

Without `page` or `limit`, `GET /products` returns the existing product array for backward compatibility. With pagination parameters, it returns `{ data, pagination }`.

## Categories

```http
GET /categories
POST /categories            admin
PATCH /categories/:id       admin
DELETE /categories/:id      admin archive
```

## Cart Coupon

```http
POST /coupons/validate
GET /coupons                admin
POST /coupons               admin
PATCH /coupons/:id          admin
DELETE /coupons/:id         admin disable
```

Validate body:

```json
{
  "code": "FIRST10",
  "subtotal": 1599
}
```

## Orders

```http
POST /orders
GET /orders/track/:orderNumber
POST /orders/:id/cancel
GET /orders                 admin
PATCH /orders/:id           admin
```

Create order body:

```json
{
  "customer": {
    "name": "Client User",
    "email": "client@demo.com",
    "phone": "8888888888"
  },
  "shippingAddress": {
    "line1": "221 Demo Street",
    "city": "Jaipur",
    "state": "Rajasthan",
    "pincode": "302001"
  },
  "billingAddress": {
    "line1": "221 Demo Street",
    "city": "Jaipur",
    "state": "Rajasthan",
    "pincode": "302001"
  },
  "shippingMethod": "standard",
  "paymentMethod": "cod",
  "paymentApp": "",
  "paymentReference": "",
  "couponCode": "DIVINE150",
  "items": [
    {
      "product": "<productId>",
      "title": "Rudraksha Aura Bracelet",
      "image": "/assets/products/rudraksha-bracelet.png",
      "price": 899,
      "compareAtPrice": 1299,
      "selectedSize": "medium-7",
      "selectedSizeLabel": "Medium - 7 inch",
      "selectedAddOns": [
        {
          "code": "siddh-energized",
          "title": "Get Siddh Energized Product",
          "price": 1000
        }
      ],
      "quantity": 1
    }
  ]
}
```

Order pricing stored by backend:

```text
mrpTotal = sum of compareAtPrice * quantity
productDiscount = mrpTotal - subtotal
subtotal = sum of selling price * quantity
discount = coupon discount
totalDiscount = productDiscount + coupon discount
shipping = standard/express shipping charge
tax = 5% of taxable subtotal after coupon discount
total = subtotal - coupon discount + tax + shipping + payment fee
```

## Payment Methods

Checkout payment choices are database-driven.

```http
GET /payments/methods
POST /payments/mock-intent
GET /payments/admin/methods        admin
POST /payments/admin/methods       admin
PATCH /payments/admin/methods/:id  admin
```

Mock online payment body:

```json
{
  "methodCode": "upi",
  "appCode": "gpay",
  "amount": 1599
}
```

Seeded UPI app choices include Google Pay, PhonePe, Paytm UPI, and BHIM. Seeded wallet choices include Amazon Pay, MobiKwik, Paytm Wallet, and Freecharge.

Production note: replace `/payments/mock-intent` with Razorpay, Cashfree, Stripe, or your selected provider before launch. Real direct app payment requires gateway keys, verified merchant UPI ID, callback/webhook handling, and provider-specific deep links.

## Client Panel

```http
GET /users/me
PATCH /users/me
PATCH /users/me/password
GET /users/me/orders
POST /users/me/wishlist/:productId
POST /users/support          public or logged-in
GET /users/support/my
POST /users/support/:id/replies
PATCH /users/support/:id/close
```

Support ticket body:

```json
{
  "name": "Client User",
  "email": "client@demo.com",
  "phone": "8888888888",
  "orderNumber": "ORD-24062001",
  "category": "order-tracking",
  "subject": "Need delivery update",
  "message": "Please help me with my order status."
}
```

## Reviews

```http
GET /reviews/product/:slug
POST /reviews/product/:slug
PATCH /reviews/:id         owner or admin
DELETE /reviews/:id        owner or admin
GET /reviews                admin
```

## Admin

```http
GET /admin/dashboard
GET /admin/customers
GET /users/support          admin
PATCH /users/support/:id    admin
```

Admin support update body:

```json
{
  "status": "in-progress",
  "reply": "We checked your order and will update you shortly."
}
```

## Seed

After PostgreSQL is configured:

```bash
npm install
npm run seed --workspace server
npm run dev --workspace server
```

Demo admin:

```text
admin@demo.com / admin123
```

Demo client:

```text
client@demo.com / client123
```
