# Step 2 — Menu Management (Kitchen Controls)

**Status:** ✅ Shipped (v1)  
**Goal:** Kitchen staff can add, edit, sell out, restock, and delete menu items without a developer or seeder.

---

## Why this step matters

Step 1 answered: *“Where do orders go?”*  
Step 2 answers: *“How do we change today’s menu?”*

Real kitchens:

- Sell out of a dish mid-rush  
- Change prices  
- Add a special  
- Hide items overnight  

If that requires code, you cannot sell the product.

---

## What we built

### Data model

**File:** `server/models/Product.js`

| Field | Role |
| --- | --- |
| `isAvailable` | Soft sold-out flag (`true` = on customer menu) |
| Existing fields | name, price, category, image, prepTime, etc. |

**Soft hide vs hard delete**

| Action | Use when |
| --- | --- |
| **Sold out** (`isAvailable: false`) | Temporary — item may return |
| **Delete** | Permanent remove from catalog |

Prefer sold out. Deleting does not rewrite old order line-item snapshots (orders keep names/prices).

### Backend APIs

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/products` | Public | Customer menu — **available only** |
| GET | `/api/products/admin` | Admin | Full catalog including sold out |
| GET | `/api/products/:id` | Public* | Detail; sold-out hidden unless admin token |
| POST | `/api/products` | Admin | Create |
| PUT | `/api/products/:id` | Admin | Update |
| PUT | `/api/products/:id/availability` | Admin | Toggle / set sold out |
| DELETE | `/api/products/:id` | Admin | Permanent delete |
| GET | `/api/products/meta/categories` | Public | Category list for forms |

\* `GET /:id` uses optional JWT: admin can open sold-out items to edit them.

### Checkout safety

**File:** `server/controllers/orderController.js`

If a customer still has a sold-out item in cart, order creation returns **400** with a clear message. Server is source of truth — never trust the client menu alone.

### Frontend

| Screen | Path | Purpose |
| --- | --- | --- |
| Menu list | `/kitchen/menu` | Filter, sold out, edit, delete |
| Product form | `/kitchen/menu/form` | Create |
| Product form + id | `/kitchen/menu/form?id=…` | Edit |

Entry points:

- Kitchen board → **Manage menu** / book icon  
- Profile (admin) → **Menu manager**

---

## Architecture lesson

```
Customer Home  →  GET /api/products           (isAvailable: true only)
Kitchen Menu   →  GET /api/products/admin     (everything)
Kitchen Toggle →  PUT .../availability
Customer Cart  →  POST /api/orders            (rejects unavailable)
```

**Skill:** Separate **read models** for customer vs staff.  
Don’t overload one endpoint with “maybe filter if admin” without clear rules — we used:

- public list = available only  
- `/admin` list = full catalog  

---

## How to test

### Prerequisites

```bash
cd server && npm run dev
cd server && npm run seed:admin   # if needed — kitchen@demo.com / kitchen123
cd client && npx expo start -c
```

### Happy path

1. Log in as **kitchen admin**.  
2. Profile → **Menu manager** (or Kitchen board → Manage menu).  
3. **Add new product** — fill name, price, category, prep time → Create.  
4. Open customer Home (or log in as customer on another session) — new dish appears.  
5. Kitchen: mark item **Sold out** — disappears from customer Home.  
6. Kitchen: **Restock** — returns to menu.  
7. Edit price → save → customer sees new price (after refresh).  
8. Optional: delete a test item permanently.

### Edge cases

| Case | Expected |
| --- | --- |
| Customer had item in cart, then sold out | Checkout fails with unavailable message |
| Non-admin opens `/kitchen/menu` | Bounced / access denied |
| Empty image URL | Server falls back to default icon URL |

---

## Files changed

```
server/
  models/Product.js                 # + isAvailable
  controllers/productController.js  # full CRUD + admin list
  routes/productRoutes.js           # admin routes
  controllers/orderController.js    # reject sold-out on checkout

client/
  src/app/kitchen/menu/index.tsx    # menu list
  src/app/kitchen/menu/form.tsx     # create/edit form
  src/app/kitchen/index.tsx         # link to menu
  src/app/profile.tsx               # Menu manager row
  src/app/_layout.tsx               # routes

docs/
  02-menu-management.md             # this file
  README.md                         # roadmap status
```

---

## What this step does *not* include

| Deferred | Why later |
| --- | --- |
| Image upload (camera/S3) | URL paste is enough for v1 |
| Multi-location menus | Single vendor only |
| Scheduled availability | Complexity; sold out is manual |
| Open/closed store hours | Can be Step 2.5 or part of deploy |

---

## Learning notes — fill in yourself

1. Why prefer `isAvailable` over deleting products?  
   _Your answer:_ ________________________________

2. Why does the public `GET /api/products` ignore sold-out items?  
   _Your answer:_ ________________________________

3. Why re-check availability on `POST /api/orders`?  
   _Your answer:_ ________________________________

4. Why is `/admin` a separate list route instead of a query on the public route?  
   _Your answer:_ ________________________________

---

## Definition of done (Step 2)

- [x] Create / update / delete products as admin  
- [x] Sold out / restock without delete  
- [x] Customer menu only shows available items  
- [x] Checkout rejects sold-out items  
- [x] Kitchen UI for list + form  
- [x] Docs + roadmap updated  

**Next step:** Step 3 — real money path + production deploy ([docs/README.md](./README.md)).
