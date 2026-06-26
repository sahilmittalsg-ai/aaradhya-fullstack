# Spiritual Commerce

An ecommerce starter inspired by a premium spiritual wearables storefront. It includes a customer shop, client account area, admin dashboard, Express API, PostgreSQL-backed models, and seed data.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node, Express, TypeScript
- Database: PostgreSQL
- Auth: JWT-ready API with seeded admin/client users

## Run Locally

Node/npm are required.

```bash
npm install
copy server\.env.example server\.env
npm run seed
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000/api`

## Demo Accounts

Admin:

```text
email: admin@demo.com
password: admin123
```

Client:

```text
email: client@demo.com
password: client123
```

## Notes

The product and hero images are original generated assets, not copied from the reference website. Replace the brand name, policies, payment gateway, shipping logic, and product catalog before production launch.

## Backend First

Backend documentation is in [server/API.md](server/API.md). Build and test the API before connecting final frontend screens.
