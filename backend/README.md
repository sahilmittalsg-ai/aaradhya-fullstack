# Aaradhya Backend

Fresh backend for the ecommerce project.

## Run

```bash
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000/api`

Health: `http://localhost:5000/api/health`

## Main Modules

- Auth with email/password and mobile OTP
- Products, sizes, add-on plans, delivery estimate data
- Cart/order pricing: MRP, discounts, subtotal, shipping, tax, payable total
- Coupons and exclusive offers
- Payment methods with UPI apps and wallets
- Customer support tickets
- Customer reviews with verified purchase detection
- Admin dashboard APIs
- CMS pages, banners, footer/site settings

Rotate the PostgreSQL password after development because it was shared in chat.
