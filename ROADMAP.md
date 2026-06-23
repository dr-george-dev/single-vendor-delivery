# 🍔 Single-Vendor Delivery App: 30-Day Build Roadmap

This document outlines the daily milestones for building a full-stack ordering and delivery application using a decoupled architecture (Node.js/Express/MongoDB backend + React Native/Expo frontend).

---

## 🏗️ Phase 1: The Headless Server & Database (Days 1–7)
**Goal:** Establish the core API contract and data models.

- [x] **Day 1:** Project Initialization & Architecture setup. Initialize both `/server` and `/client` directories. Install Express, Mongoose, and nodemon in the server. Set up your basic `server.js` file.
  - Commit: `chore: initialize server and client directories with core backend dependencies`

- [x] **Day 2:** MongoDB Connection. Create `/config/db.js` to connect to a local or Atlas instance using Mongoose. Implement error handling for connection drops.
  - Commit: `feat: establish robust MongoDB connection pipeline`

- [x] **Day 3:** User & Auth Schemas. Create the User Mongoose model (`/models/User.js`) with fields for name, email, password, and roles (admin vs. customer).
  - Commit: `feat: implement User mongoose schema`

- [x] **Day 4:** Product Schema. Create the Product model with fields matching the UI: name, price, description, calories, estimated preparation time, rating, and image URL.
  - Commit: `feat: implement Product mongoose schema with validation`

- [x] **Day 5:** Order Schema. Create the Order model with product snapshots, total price, customer reference, and a status enum (`Pending`, `Preparing`, `Completed`).
  - Commit: `feat: implement Order schema with state enums`

- [x] **Day 6:** Product API Controllers. Build the logic in `/controllers/productController.js` to fetch all products and fetch a single product by ID.
  - Commit: `feat: create product GET controllers`

- [x] **Day 7:** Product API Routes. Wire controllers into `/routes/productRoutes.js` and test them using VS Code Thunder Client or Postman.
  - Commit: `feat: map and test product API routes`

---

## 🔐 Phase 2: Business Logic & Security (Days 8–14)
**Goal:** Secure the backend and finalize order processing logic.

- [x] **Day 8:** User Authentication (Sign Up). Implement the signup controller and hash passwords securely with bcryptjs before saving to MongoDB.
  - Commit: `feat: implement secure user registration and password hashing`

- [x] **Day 9:** User Authentication (Login). Implement the login controller, compare hashed passwords, and generate a JWT for session persistence.
  - Commit: `feat: implement user login and JWT generation`

- [x] **Day 10:** Auth Middleware. Create `/middleware/authMiddleware.js` to verify the user JWT before allowing access to protected routes.
  - Commit: `feat: create JWT verification middleware`

- [x] **Day 11:** Order Controllers (Creation). Accept a cart array from the frontend, calculate the total price on the server, and save the order to the database.
  - Commit: `feat: implement secure order creation controller`

- [x] **Day 12:** Order Controllers (Retrieval). Add logic for users to fetch their order history and an admin endpoint to fetch all active orders.
  - Commit: `feat: implement order history retrieval controllers`

- [x] **Day 13:** Order API Routes. Connect order controllers to routes and protect them with auth middleware.
  - Commit: `feat: map protected order API routes`

- [x] **Day 14:** Backend Code Audit & Cleanup. Refactor controller logic, add descriptive comments, and standardize formatting.
  - Commit: `refactor: clean up backend logic and standardize error responses`

---

## 📱 Phase 3: Mobile UI & Navigation Setup (Days 15–21)
**Goal:** Initialize Expo and build the visual shell of the mobile app.

- [ ] **Day 15:** Expo Setup & Folder Structure. Initialize Expo Router or React Navigation and create `/src/components`, `/src/screens`, and `/src/store`.
  - Commit: `chore: configure Expo frontend architecture`

- [ ] **Day 16:** Navigation Stack. Set up the primary screen flow: Home → Product Details → Cart → Success.
  - Commit: `feat: implement core mobile navigation stack`

- [ ] **Day 17:** UI Foundation — Home Screen. Build the Home screen layout with a search bar, category pills, and popular items list using dummy data.
  - Commit: `feat: build Home screen UI layout`

- [ ] **Day 18:** UI Foundation — Product Detail Screen. Build the product detail view with image header, title, price, and quantity selector.
  - Commit: `feat: build Product Detail screen layout`

- [ ] **Day 19:** UI Foundation — Cart Screen. Build the checkout layout with selected items, subtotal, and a checkout button.
  - Commit: `feat: build Cart screen layout`

- [ ] **Day 20:** UI Foundation — Success Screen. Build the order confirmation screen with a success checkmark and estimated delivery time.
  - Commit: `feat: build Order Success screen layout`

- [ ] **Day 21:** Reusable Components. Extract repeated UI elements like the add-to-cart button and product card into reusable components.
  - Commit: `refactor: extract UI elements into reusable components`

---

## ⚡ Phase 4: State Management & API Integration (Days 22–28)
**Goal:** Bring the UI to life by connecting it to the backend.

- [ ] **Day 22:** Zustand Cart State. Install Zustand and create `/store/cartStore.js` to manage cart state and quantities.
  - Commit: `feat: implement global cart state using Zustand`

- [ ] **Day 23:** Connect Cart UI to State. Bind the `+` / `-` buttons on Product Detail and Cart screens to the Zustand store.
  - Commit: `feat: bind UI buttons to cart state manager`

- [ ] **Day 24:** Fetch Products API. Use `fetch` or `axios` in Expo to load product data from the Node server and show it on the Home screen.
  - Commit: `feat: integrate product list fetching from backend`

- [ ] **Day 25:** Auth Integration. Send login credentials to the backend, receive a JWT, and store it securely with Expo SecureStore.
  - Commit: `feat: implement frontend authentication flow and secure storage`

- [ ] **Day 26:** Checkout Integration. Wire the checkout action to send cart data and the JWT to `POST /api/orders`.
  - Commit: `feat: integrate order submission with backend API`

- [ ] **Day 27:** Loading States & Error Handling. Add loading indicators and error messages for API calls.
  - Commit: `feat: implement loading states and error UI feedback`

- [ ] **Day 28:** Image Handling. Ensure product images are served correctly from the backend or via external URLs for Expo's `<Image>` component.
  - Commit: `fix: map database image URLs to UI components`

---

## 🚀 Phase 5: Polish & Documentation (Days 29–30)
**Goal:** Finalize the project for portfolio readiness.

- [ ] **Day 29:** Final QA & Bug Squashing. Run the full flow (Login → Browse → Add to Cart → Checkout) and fix responsive styling issues.
  - Commit: `fix: resolve UI overflows and finalize end-to-end testing`

- [ ] **Day 30:** README & Documentation. Create a polished `README.md` with screenshots, tech stack details, and local setup instructions.
  - Commit: `docs: write comprehensive README and project documentation`
