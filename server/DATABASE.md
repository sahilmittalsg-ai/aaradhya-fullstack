# Database Plan

This backend is designed so the customer website, client panel, and admin panel can all be driven from PostgreSQL.

The current implementation stores app collections as JSONB documents in a shared `app_documents` table. This keeps the API flexible for the existing storefront/admin data while using PostgreSQL as the production database.

## Storefront Content

### `sitesettings`

Controls global brand details.

- brand name and logo text
- top announcement bar
- support email and phone
- free shipping threshold
- header navigation
- footer links
- social links

### `banners`

Controls homepage hero, collection banners, and promo strips.

- title, eyebrow, subtitle
- image
- CTA label and URL
- placement
- sort order
- active/inactive

### `homesections`

Controls homepage blocks.

- featured products
- collection cards
- benefits
- testimonials
- brand story

### `pages`

Controls CMS pages.

- about
- shipping policy
- refund and return policy
- returns/exchange
- cancellation policy
- cashback policy
- terms of service
- bulk/wholesale
- contact us
- marketplace store
- privacy policy
- support pages

## Commerce

### `products`

Main catalog table.

- title, slug, subtitle, description
- category and collection
- price and compare price
- stock
- images
- SKU
- tags, benefits, materials, care instructions
- size options
- add-on service plans such as Siddh Energized Product
- delivery estimate day ranges
- featured/active

### `categories`

Shop filters and navigation groups.

### `coupons`

Discount management.

- flat or percent
- minimum subtotal
- active/inactive

### `orders`

Customer checkout data.

- customer details
- shipping address
- ordered items snapshot
- selected size and add-on plans
- MRP total
- discount on MRP
- subtotal
- coupon discount
- total discount
- shipping
- tax
- final amount to pay
- subtotal, shipping, discount, total
- payment method and status
- payment provider, reference, and extra fee
- shipment status

### `paymentmethods`

Checkout methods managed by admin.

- COD
- UPI
- card
- net banking
- wallet
- provider name
- app choices such as Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, MobiKwik
- customer instructions
- active/inactive

### `reviews`

Product reviews and rating management.

## Accounts

### `users`

Admin and client accounts.

- role: admin/client
- addresses
- wishlist

### `otpcodes`

Mobile number OTP login.

- phone number
- hashed OTP
- expiry
- attempts
- consumed status

### `supporttickets`

Client support panel and admin replies.

- order tracking
- returns/exchange
- cancellation
- product information
- something else
- admin status and replies

### `newslettersubscribers`

Footer/newsletter capture for marketing.

## Build Order

1. Backend + database
2. Customer website view using `/api/content/storefront`, `/api/products`, `/api/categories`
3. Client panel using `/api/users/me`, `/api/users/me/orders`, `/api/users/support`
4. Admin panel using admin-protected APIs for products, orders, users, banners, pages, sections, coupons, reviews
