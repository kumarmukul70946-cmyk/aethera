# Aethera Commerce

A production-quality full-stack e-commerce platform built with React, Node.js, Express, MongoDB, and Tailwind CSS.

---

## 1. Technology Stack

### Frontend
- **Runtime & Bundler:** Vite
- **UI Library:** React 19 / 18
- **Styling:** Tailwind CSS (Official Vite integration)
- **Routing:** React Router (`react-router-dom`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`) & `react-redux`
- **HTTP Client:** Axios (configured with `withCredentials: true` for HTTP-only cookies)
- **Animations:** Framer Motion
- **3D Graphics:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)

### Backend
- **Runtime:** Node.js (ES Modules)
- **Web Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Security & Identity:**
  - `bcryptjs` (One-way salted password hashing, 12 rounds)
  - `jsonwebtoken` (Signed JWT session tokens in HTTP-only cookies)
  - `cookie-parser` (HTTP-only cookie parser)
  - `express-validator` (Schema-based request payload validation)
  - `express-rate-limit` (General & auth-specific brute force rate limiting)
  - `helmet` (Secure HTTP response headers)
  - `cors` (Configured with credentials and trusted frontend origin)
  - `dotenv` (Environment variable management)
  - `nodemon` (Development hot-reloader)

---

## 2. System Architecture & Request Pipeline

```text
React Frontend (Redux Toolkit / Axios withCredentials: true)
                         │
                         ▼
                  Express Router
                         │
                         ▼
             express-validator (Schema validation)
                         │
                         ▼
        protect + authorize("admin") (JWT ownership guards)
                         │
                         ▼
         Controller (Extracts req, returns standardized JSON)
                         │
                         ▼
          Service Layer (Business rules, stock safety, snapshots)
                         │
                         ▼
        Mongoose Model (Schema validation, indexes, lean() reads)
                         │
                         ▼
                      MongoDB
```

---

## 3. Product Reviews, Ratings & Verified Purchases (Part 7)

### 3.1 Strict Verified Purchase Engine
Customers cannot submit a review simply by claiming ownership. When a customer sends `POST /api/products/:productId/reviews`:
```text
Client (POST /api/products/:productId/reviews { rating: 5, comment: "..." })
                         │
                         ▼
             Authenticate user (req.user._id)
                         │
                         ▼
        Find order owned by user with status: DELIVERED
        containing this product (items.product: productId)
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
       Found                         Not Found
          │                             │
          ▼                             ▼
   Set verifiedPurchase = true   Reject 403 Forbidden
          │
          ▼
   Enforce One-Review-Per-User (user + product index)
          │
          ▼
   Save Review (isApproved: true, helpfulCount: 0)
          │
          ▼
   MongoDB Aggregation: Recalculate Product.rating & reviewCount
```

### 3.2 Server-Side Rating Calculation
Product scores and star breakdown distributions are never calculated by the frontend:
```javascript
// Aggregated across all approved reviews for a product:
const stats = await Review.aggregate([
  { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
  { $group: { _id: "$rating", count: { $sum: 1 } } }
]);
averageRating = totalReviews > 0 ? Math.round((totalScore / totalReviews) * 10) / 10 : 0;
```
If all reviews are deleted, ratings safely reset to `0.0` with `0` reviews.

### 3.3 Helpful Review Voting
To prevent vote manipulation, helpful votes are tracked in a dedicated `ReviewHelpful` collection:
- Compound unique index: `{ user: 1, review: 1 }`
- Duplicate vote attempts by the same customer return `400 Bad Request`.
- Helpful counts increment atomically via `$inc: { helpfulCount: 1 }`.

### 3.4 Future AI Review Summarizer Foundation
Approved reviews stored in this subsystem provide clean, authentic customer sentiment data for subsequent AI review summarization and vector-based recommendations.

---

## 4. API Endpoints Table

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user, issue HTTP-only cookie |
| `POST` | `/api/auth/logout` | Public | Invalidate session, clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Return profile of current user |

### Products & Categories (`/api/products`, `/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Filtered, sorted, paginated product catalog |
| `GET` | `/api/products/:id` | Public | Product details by ID |
| `GET` | `/api/products/slug/:slug` | Public | Product details by slug |
| `GET` | `/api/categories` | Public | List categories with product count |

### Cart & Wishlist APIs (`/api/cart`, `/api/wishlist`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Authenticated | Get cart with live prices and subtotals |
| `POST` | `/api/cart/items` | Authenticated | Add item with variant choices |
| `PUT` | `/api/cart/items/:productId` | Authenticated | Update quantity with stock validation |
| `DELETE` | `/api/cart/items/:productId` | Authenticated | Remove item from cart |
| `DELETE` | `/api/cart` | Authenticated | Clear cart |
| `GET` | `/api/wishlist` | Authenticated | Get saved wishlist products |
| `POST` | `/api/wishlist/:productId` | Authenticated | Add product to wishlist |
| `DELETE` | `/api/wishlist/:productId` | Authenticated | Remove product from wishlist |
| `POST` | `/api/wishlist/:productId/move-to-cart` | Authenticated | Transfer wishlist product to cart |

### Address & Order APIs (`/api/addresses`, `/api/orders`, `/api/admin/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/addresses` | Authenticated | Get saved delivery addresses |
| `POST` | `/api/addresses` | Authenticated | Create address (auto-default first address) |
| `PUT` | `/api/addresses/:id` | Authenticated | Update address details |
| `DELETE` | `/api/addresses/:id` | Authenticated | Delete address |
| `POST` | `/api/coupons/validate` | Authenticated | Validate coupon against cart subtotal |
| `POST` | `/api/orders` | Authenticated | Place order (server calculation, atomic stock update) |
| `GET` | `/api/orders` | Authenticated | Paginated order history for current user |
| `GET` | `/api/orders/:id` | Authenticated | Order details (enforces ownership) |
| `PATCH` | `/api/orders/:id/cancel` | Authenticated | Cancel order and automatically restore stock |
| `GET` | `/api/admin/orders` | Admin | List all orders with filters and pagination |
| `PATCH` | `/api/admin/orders/:id/status` | Admin | Update status with lifecycle validation |

### Reviews & Ratings APIs (`/api/products/:id/reviews`, `/api/reviews`, `/api/admin/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products/:productId/reviews` | Public | Paginated approved reviews with sorting & rating filter |
| `GET` | `/api/products/:productId/reviews/summary` | Public | Aggregate average rating and 1-5 star distribution |
| `GET` | `/api/products/:productId/reviews/eligibility` | Authenticated | Check if user has delivered purchase and can review |
| `POST` | `/api/products/:productId/reviews` | Authenticated | Submit verified review for delivered purchase |
| `PUT` | `/api/reviews/:id` | Authenticated | Update own review (rating, comment) |
| `DELETE` | `/api/reviews/:id` | Authenticated | Delete review (author or admin) |
| `POST` | `/api/reviews/:id/helpful` | Authenticated | Mark review as helpful (1 vote per user) |
| `GET` | `/api/admin/reviews` | Admin | List all reviews across the platform |
| `PATCH` | `/api/admin/reviews/:id/moderate` | Admin | Moderate approval (`isApproved: true/false`) |
| `DELETE` | `/api/admin/reviews/:id` | Admin | Delete any review as admin |

---

## 5. Local Development Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB running locally on port 27017 or a MongoDB Atlas URI

### Step-by-Step Installation

1. **Clone and Install:**
   ```bash
   cd Aethera-Commerce
   cd server && npm install
   cd ../client && npm install
   ```

2. **Configure Environment:**
   Create `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/aethera_commerce
   JWT_SECRET=super_secret_jwt_key_aethera_2026_modern
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ```

3. **Seed Database:**
   ```bash
   cd server
   npm run seed        # Seeds categories, products, and coupons
   npm run seed:admin  # Seeds development administrator account
   ```

4. **Run Verification Test Suites:**
   ```bash
   npm run test:auth          # 17/17 passed (Authentication & RBAC)
   npm run test:product       # 28/28 passed (Product Catalog & CRUD)
   npm run test:checkout      # 42/42 passed (Cart, Wishlist, Addresses, Coupons, Checkout & Orders)
   npm run test:review        # 31/31 passed (Reviews, Ratings, Verified Purchases & Moderation)
   npm run test:customization # 7/7 passed (Part 10 3D Customization & Dynamic Materials)
   npm run test:interaction   # 35/35 passed (Part 12 Interaction Tracking & Event Analytics)
   npm run test:recommendation # 30/30 passed (Part 13 Personalized Recommendation Engine)
   ```

5. **Start Development Servers:**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev

   # Terminal 2: Frontend
   cd client && npm run dev
   ```
