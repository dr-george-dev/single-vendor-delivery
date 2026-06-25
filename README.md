# Single-Vendor Food Delivery App

A polished full-stack food delivery application built for mobile and web. This project pairs a performant Node.js + MongoDB backend with an Expo-powered React Native frontend for a seamless ordering experience.

---

## Key Features

### Mobile App (Frontend)
- **Premium UI/UX:** NativeWind (Tailwind CSS) with animated interactions and modern layout components.
- **Global State:** Cart and authentication state managed through Zustand.
- **Authentication:** Login and registration flows with secure token storage in Expo SecureStore.
- **Dynamic Checkout:** Real-time subtotal, delivery fee calculation, and order submission.
- **Order History:** Dedicated orders screen with user-specific purchase tracking.
- **Cross-platform:** Supports iOS, Android, and Web through Expo.

### API Server (Backend)
- **RESTful architecture:** Modular routes for Products, Users, and Orders.
- **Authentication / security:** JWT-protected routes and password hashing via bcryptjs.
- **MongoDB:** Data persisted using Mongoose with schema validation.
- **Server-side validation:** Checkout pricing verified on the backend for data integrity.

---

## Tech Stack

- **Frontend:** React Native, Expo Router, NativeWind, Zustand
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Styling:** Tailwind CSS via NativeWind
- **Storage:** Expo SecureStore

---

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed locally or a MongoDB Atlas account
- Expo Go installed on your phone, or an emulator via Android Studio / Xcode

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/delivery-app
JWT_SECRET=your_super_secret_key_here
```

Start the backend server:

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
```

Start the Expo app with cache reset:

```bash
npx expo start -c
```

Open the app on a device or simulator using the Expo CLI instructions.

> If testing on a physical device, ensure your API host configuration matches your computer's local IP address.

---

## API Endpoints

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/api/products` | Retrieve all products | Public |
| GET | `/api/products/:id` | Retrieve product details | Public |
| POST | `/api/users` | Register a new user | Public |
| POST | `/api/users/login` | Authenticate user and receive token | Public |
| GET | `/api/users/profile` | Fetch profile data | Private |
| POST | `/api/orders` | Submit a new order | Private |
| GET | `/api/orders/myorders` | Fetch current user order history | Private |

---

## Notes

- The frontend depends on the backend being reachable from the device or emulator.
- Verify your local network configuration and Expo host settings if API requests fail.

---

## Development

This project was developed as part of a structured delivery app prototype. The architecture prioritizes clean separation between frontend and backend, with a strong focus on usability and order flow reliability.
