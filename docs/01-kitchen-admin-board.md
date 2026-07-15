# Step 1 — Kitchen / Admin Order Board

**Status:** ✅ Shipped (v1)  
**Goal:** A kitchen can see live orders and advance them through prep → delivery without opening a database.

---

## Why this step comes first

A customer app alone is a **demo**.  
A kitchen board is **operations**.

When you sell to a kitchen, the owner asks:

> “Where do my cooks see tickets?”

This step answers that.

---

## What we built

### Backend

| Piece | File | Purpose |
| --- | --- | --- |
| `admin` middleware | `server/middleware/authMiddleware.js` | Only `role === 'admin'` can hit kitchen APIs |
| Lock list-all-orders | `server/routes/orderRoutes.js` | `GET /api/orders` = `protect + admin` (was insecure before) |
| Status update API | `PUT /api/orders/:id/status` | Body `{ advance: true }` or `{ status: "Preparing" }` |
| Status filters | `getOrders` query | `?status=Pending` or `?active=true` |
| Create admin user | `server/scripts/createAdmin.js` | Seed/promote kitchen login |

### Frontend

| Piece | File | Purpose |
| --- | --- | --- |
| Kitchen board UI | `client/src/app/kitchen/index.tsx` | Live tickets, tabs, advance buttons |
| Profile entry | `client/src/app/profile.tsx` | “Open kitchen board” for admins only |
| Stack route | `client/src/app/_layout.tsx` | Registers `kitchen/index` |

---

## Order status workflow

```
Pending  →  Preparing  →  Out for Delivery  →  Delivered
  (new)      (cooking)      (on the road)         (done)
```

- **Advance button** moves one step forward (`advance: true`).
- Expanded ticket also allows **manual jump** (fix mistakes).
- Tabs: Active · New · Cooking · Delivery · Done.

---

## Security lesson (important)

### Before
`GET /api/orders` was `protect` only → **any logged-in customer could list every order**.

### After
```js
router.route('/').get(protect, admin, getOrders);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
```

**Skill:** Private ≠ admin. Always separate:

1. **Authenticated** (logged in)  
2. **Authorized** (allowed for this role)

Registration never accepts `role` from the client — admins are created with `seed:admin`.

---

## API reference (kitchen)

### List all orders
```http
GET /api/orders
Authorization: Bearer <admin_jwt>
```

Optional query:

```http
GET /api/orders?active=true
GET /api/orders?status=Pending
```

### Update status
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_jwt>
Content-Type: application/json

{ "advance": true }
```

or

```json
{ "status": "Preparing" }
```

Valid statuses: `Pending` | `Preparing` | `Out for Delivery` | `Delivered`

---

## How to run & test (do this)

### 1. Start Mongo + API

```bash
cd server
npm run dev
```

### 2. Create kitchen admin account

```bash
cd server
npm run seed:admin
```

Default login:

| Field | Value |
| --- | --- |
| Email | `kitchen@demo.com` |
| Password | `kitchen123` |

Custom:

```bash
node scripts/createAdmin.js chef@mykitchen.com "Chef Maria" secretpass
```

### 3. Start the app

```bash
cd client
npx expo start -c
```

### 4. Happy path

1. **Device A (customer):** register a normal user → add items → place order.  
2. **Device B or same app (kitchen):** log in as `kitchen@demo.com` → Profile → **Open kitchen board**.  
3. See the new ticket under **New / Active**.  
4. Tap **Start preparing** → **Out for delivery** → **Mark delivered**.  
5. On customer app, open Order detail — status should match.  
6. Leave kitchen board open; place another order — within ~12s you should get a **New order!** alert (polling).

---

## UI behaviors to understand

| Behavior | Implementation idea |
| --- | --- |
| Auto-refresh | `setInterval` every 12s calling `GET /api/orders` silently |
| New order alert | Compare previous Set of order IDs vs new fetch |
| Role gate | If `user.role !== 'admin'`, bounce with alert |
| Expand ticket | Tap card → full line items + manual status chips |
| Pull to refresh | `RefreshControl` for impatient cooks |

**Skill:** Polling is fine for v1 (simple, works offline-ish on LAN). Later you can upgrade to WebSockets/push — don’t block shipping on that.

---

## Files changed (checklist)

```
server/
  middleware/authMiddleware.js   # + admin
  controllers/orderController.js # + updateOrderStatus, filters
  routes/orderRoutes.js          # admin guards + PUT status
  scripts/createAdmin.js         # new
  package.json                   # seed:admin script

client/
  src/app/kitchen/index.tsx      # new board
  src/app/profile.tsx            # kitchen CTA
  src/app/_layout.tsx            # route

docs/
  README.md
  01-kitchen-admin-board.md      # this file
```

---

## What this step does *not* include (on purpose)

| Deferred | Why later |
| --- | --- |
| Sound / push notifications | Polling alert is enough for tablet-on-counter v1 |
| Separate kitchen tablet web app | Same Expo screen works; dedicated web can wait |
| Driver role screens | Role exists on User; no driver flow yet |
| Menu CRUD | **Step 2** |
| Real card payments | **Step 3** |

---

## Learning notes — write these in your own words

After testing, fill this in (seriously — it locks the skill):

1. What is the difference between `protect` and `admin`?  
   _Your answer:_ ________________________________

2. Why must `/myorders` be registered **before** `/:id` in Express?  
   _Your answer:_ ________________________________

3. Why don’t we let the register form set `role: "admin"`?  
   _Your answer:_ ________________________________

4. How does the board know a new order arrived without WebSockets?  
   _Your answer:_ ________________________________

---

## Definition of done (Step 1)

- [x] Admin-only API for listing all orders  
- [x] Admin can advance order status  
- [x] Kitchen board UI with filters and auto-refresh  
- [x] New-order alert on poll  
- [x] Seed script for kitchen login  
- [x] Profile entry for admins  
- [x] Docs written  

**Next step:** [Menu management](./README.md) so the kitchen can add products / mark sold out without you.

---

## Quick troubleshooting

| Problem | Fix |
| --- | --- |
| “Kitchen access only” | You’re logged in as customer — use `seed:admin` account |
| Board empty but customer ordered | Confirm both hit same API (`API_BASE_URL`) and same Mongo DB |
| 401 on status update | Token expired — log out/in as admin |
| `createAdmin` fails | Is Mongo running? Is `MONGO_URI` in `server/.env`? |
