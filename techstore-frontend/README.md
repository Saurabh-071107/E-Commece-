# FORM — Tech Store frontend

A responsive editorial-style e-commerce frontend built with React, Vite, Tailwind CSS, React Router, Axios and Lucide icons.

## Run locally
1. Install Node.js 20+.
2. Extract this folder and open a terminal in it.
3. Run `npm install`
4. Copy `.env.example` to `.env` (optional; mock mode works without it).
5. Run `npm run dev`

## Included
- Responsive home, shop, product details, search, cart, checkout, login/register, account, orders and admin pages.
- Search, category filters, sort, wishlist toggle, cart quantity updates and local persistence.
- Demo auth and order flow so the UI can be explored before the backend exists.
- Axios API client and service layer ready for Express endpoints.
- Loading, empty and error states.

## Demo mode vs backend mode
The app runs on local mock data by default. Set `VITE_API_URL` to your backend base URL to enable API reads. The API client falls back to mock data for catalog reads if the API is unreachable. Auth, checkout and admin actions are explicitly demo-only until you implement their backend endpoints.

Suggested API contract:
- `GET /products?search=&category=&sort=&page=&limit=`
- `GET /products/:id`
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:productId`, `DELETE /cart/items/:productId`
- `POST /orders`, `GET /orders/my-orders`, `GET /orders/:id`
- `GET /admin/orders`, `PATCH /admin/orders/:id`, `POST /admin/products`

Before connecting real auth, implement secure cookie-based access/refresh token handling on the server, configure CORS with credentials, and never trust client-side totals, stock, roles, or payment status. Verify Razorpay payments server-side.

## Suggested backend structure
`config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `services/`, `utils/`, `server.js`.

## Replace demo behavior
- `src/data/products.js` contains the seed catalog.
- `src/services/api.js` contains Axios and API functions.
- `src/context/StoreContext.jsx` owns cart/wishlist state.
- `src/context/AuthContext.jsx` owns demo session state.
- `src/pages/` contains route pages.
