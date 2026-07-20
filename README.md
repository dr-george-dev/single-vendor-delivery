# Single-Vendor Food Delivery App

A full-stack food delivery prototype for a **single restaurant/vendor** (not a multi-restaurant marketplace). Customers browse a menu, build a cart, check out, and track orders. Kitchens run a live **order board**.

**Stack:** Expo + React Native + NativeWind (frontend) · Node.js + Express + MongoDB (backend) · JWT auth · Zustand state

---

## Ship to a kitchen (progress)

We are hardening this app so you can **sell it to a real kitchen**. Each step is documented in `/docs` so you never lose the thread.

| Step | Status | Learn more |
| --- | --- | --- |
| **1. Kitchen order board** | ✅ Done | [docs/01-kitchen-admin-board.md](./docs/01-kitchen-admin-board.md) |
| **2. Menu management** | ✅ Done | [docs/02-menu-management.md](./docs/02-menu-management.md) |
| **3. Payments + production deploy** | ⬜ Next | [docs/README.md](./docs/README.md) |

**Index of all ship docs:** [docs/README.md](./docs/README.md)

### Quick kitchen test (Step 1)

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — create kitchen login (once)
cd server && npm run seed:admin
# → kitchen@demo.com / kitchen123

# Terminal 3 — app
cd client && npx expo start -c
```

1. Customer account: place an order.  
2. Log in as **kitchen@demo.com** → Profile → **Open kitchen board**.  
3. Advance: Pending → Preparing → Out for Delivery → Delivered.

---

## Key Features

### Customer app (Frontend)
- **Premium UI/UX** — shared design tokens, press animations, empty/loading/error states
- **Global state** — cart + auth via Zustand
- **Authentication** — login/register with SecureStore (native) / localStorage (web)
- **Checkout** — address, payment method, server-validated pricing, free-delivery progress
- **Orders** — history list, detail screen with status timeline, reorder
- **Cross-platform** — iOS, Android, and Web via Expo

### Kitchen ops
- **Kitchen board** (`/kitchen`) — live tickets, status tabs, one-tap advance
- **Menu manager** (`/kitchen/menu`) — add/edit products, sold out / restock, delete
- **Auto-refresh + new-order alert** — polls every ~12s
- **Admin-only APIs** — customers cannot list everyone’s orders or edit the menu

### API Server (Backend)
- REST routes for Products, Users, Orders
- JWT + **role-based** access (`customer` vs `admin`)
- Product `isAvailable` flag — sold-out hidden from customer menu
- Mongoose schemas with validation
- Server recalculates order totals (prevents client price tampering)
- Checkout rejects sold-out products
- `npm run seed:admin` — create kitchen staff login

---

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React Native, Expo Router, NativeWind, Zustand, Expo SecureStore |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Styling | Tailwind CSS via NativeWind |

---

## Getting Started

### Prerequisites
- Node.js
- MongoDB (local or Atlas)
- Expo Go on a phone, or Android Studio / Xcode simulators

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/delivery-app
JWT_SECRET=your_super_secret_key_here
```

```bash
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npx expo start -c
```

> On a physical device, the app must reach your machine’s LAN IP (see `client/src/config/api.ts`).

---

## API Endpoints

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/api/products` | Customer menu (available only) | Public |
| GET | `/api/products/admin` | Full catalog incl. sold out | **Admin** |
| GET | `/api/products/:id` | Product detail | Public* |
| POST | `/api/products` | Create product | **Admin** |
| PUT | `/api/products/:id` | Update product | **Admin** |
| PUT | `/api/products/:id/availability` | Sold out / restock | **Admin** |
| DELETE | `/api/products/:id` | Delete product | **Admin** |
| POST | `/api/users` | Register | Public |
| POST | `/api/users/login` | Login → JWT | Public |
| GET | `/api/users/profile` | Current user | Private |
| POST | `/api/orders` | Create order | Private |
| GET | `/api/orders/myorders` | My order history | Private |
| GET | `/api/orders/:id` | Order detail | Private (owner or admin) |
| GET | `/api/orders` | All orders (kitchen board) | **Admin** |
| PUT | `/api/orders/:id/status` | Advance / set status | **Admin** |

\* Sold-out products return 404 to customers; kitchen admin with JWT can still open them for editing.

---

# UI Upgrade Deep Dive — Learn How Premium Apps Are Built

This section is a **study guide**, not a changelog dump. Each upgrade explains **what changed**, **why it matters**, and **what skill you should take away**.

Read it like a senior engineer walking you through a PR.

---

## The core lesson

> **Premium UI is not “prettier colors.”**  
> It is **systems**: tokens → reusable components → consistent screens → intentional motion → honest loading/empty/error states.

Amateur apps style each screen in isolation.  
Professional apps extract patterns so every screen *feels like the same product*.

```
Brand tokens  →  UI primitives  →  Composite components  →  Screens
   (colors)        (button)           (ProductCard)         (Home)
```

That pipeline is the single most important architecture idea in this upgrade.

---

## 1. Design tokens — one source of truth

**File:** `client/src/constants/brand.ts`

### What we built
A single `Brand` object for colors (background, ink, accent, borders, success/danger) plus maps for:
- **Categories** (emoji + label)
- **Order statuses** (label, colors, timeline step index)

### Why this matters
Before, screens mixed random hex values:
- `#FAFAFA`, `#f4f6f8`, `#f8f9fa` for “background”
- orange in one place, black CTA in another

That creates **visual drift**. Users feel it even if they can’t name it.

### Skill to practice
When you start a UI task, **define tokens first**:

```ts
export const Brand = {
  bg: '#F6F4F1',
  surface: '#FFFFFF',
  ink: '#121212',
  accent: '#FF5A1F',
  // ...
} as const;
```

Then every component imports `Brand` instead of inventing colors.

**Exercise for you:** Change `Brand.accent` once. If the whole app shifts together, your system works. If half the screens stay old-orange, you still have hard-coded values to hunt down.

---

## 2. Press feedback — apps should feel physical

**File:** `client/src/components/ui/PressableScale.tsx`

### What we built
A wrapper around `Pressable` that springs scale to `0.96` on press-in and back to `1` on press-out using the Animated API + native driver.

### Why this matters
Default `TouchableOpacity` opacity flash is fine, but premium food apps (DoorDash, Uber Eats, Apple’s own apps) use **subtle scale**. It signals “this is tappable” without looking cartoonish.

### Skill to practice
```ts
Animated.spring(scale, {
  toValue: 0.96,
  useNativeDriver: true, // GPU-friendly; only transform/opacity
  speed: 40,
  bounciness: 6,
}).start();
```

**Rules of thumb:**
- Prefer `useNativeDriver: true` for transforms/opacity
- Keep scale mild (`0.94–0.98`) — aggressive scale feels gimmicky
- Disable animation when `disabled` so dead buttons don’t “bounce”

**Exercise:** Build a `PressableScale` that also dims opacity slightly. Compare feel on a real phone (simulators hide micro-interactions).

---

## 3. UI primitives — stop copy-pasting buttons

**Folder:** `client/src/components/ui/`

| Component | Job | Learning point |
| --- | --- | --- |
| `PrimaryButton` | Primary / dark / ghost / danger CTAs | Variants > forked components |
| `IconButton` | Circular back/heart/settings buttons | Consistent hit targets (~44px) |
| `Badge` | Status / promo chips | Semantic tones (`success`, `warning`) |
| `QuantityStepper` | + / − qty control | Shared interaction for cart + product |
| `EmptyState` | Icon + title + optional CTA | Empty is a real UI state, not blank space |
| `FloatingCartBar` | Sticky “View cart” pill | Global cart affordance on Home |

### Why this matters
Copy-pasting a “black rounded button” into 6 screens means:
1. Six places to update when design changes  
2. Six slightly different paddings/fonts  
3. Bugs only fixed on the screen you remember  

Primitives flip that: **change once, everywhere improves**.

### Skill to practice — the variant pattern

```ts
variant?: 'primary' | 'dark' | 'ghost' | 'danger'
```

One component, many looks, shared loading/disabled behavior. This is the same idea as design systems (Material, Radix, Shopify Polaris) at small scale.

**Exercise:** Add a `size: 'sm' | 'md' | 'lg'` prop to `PrimaryButton` without duplicating the whole component.

---

## 4. Composite components — ProductCard as a case study

**File:** `client/src/components/ProductCard.tsx`

### What we built
Home no longer inlines a huge product cell. It renders:

```tsx
{filteredProducts.map((product) => (
  <ProductCard key={product._id} product={product} />
))}
```

The card owns:
- Image + badge + favorite icon  
- Rating / prep time  
- Price  
- Quick-add (`+`) that writes to Zustand **without navigating**

### Why this matters
Screens should **orchestrate** data and navigation.  
Components should **present** a domain object (a product).

That’s the “container vs presentational” idea, even if you don’t use those names.

### Skill to practice
Ask for every block of JSX on a screen:

> “Is this a one-off layout, or a reusable product of the domain?”

If it’s a product, order, or address — extract it.

**Exercise:** Build an `OrderCard` used by both `orders.tsx` and a future “Active order” home banner.

---

## 5. Screen-by-screen upgrades (and the UX lessons)

### Home — `client/src/app/index.tsx`

| Upgrade | Why professionals do this |
| --- | --- |
| Warm paper background (`Brand.bg`) | Warm neutrals feel “food” more than pure gray |
| Search with clear (×) control | Incomplete search UX frustrates power users |
| Category chips with active elevation | Selected state must be *obvious* |
| Promo hero with decorative circles | Depth without heavy images |
| Pull-to-refresh | Users expect swipe-down on lists |
| `FloatingCartBar` when cart has items | Always-visible path to checkout |
| Empty + error states with retry | Network failure is normal on mobile |

**Skill:** Design for **three realities** of every list screen:
1. Loading  
2. Success (with 0 or N items)  
3. Error  

If you only design success, your app feels broken on day one of real users.

---

### Product detail — `client/src/app/product/[id].tsx`

| Upgrade | Lesson |
| --- | --- |
| Modal presentation (`_layout.tsx`) | Product detail as a sheet feels lighter than a full push |
| Image scale-in + content slide-up | Entry animation sells “premium” cheaply |
| Metrics strip (rating / time / kcal) | Scanable facts beat long paragraphs |
| Sticky footer: stepper + “Add to cart $X” | Primary action always visible (thumb zone) |
| Heart toggle (filled vs outline) | Micro-state makes UI feel alive |

**Skill:** Sticky footers for commerce.  
If the buy button scrolls off-screen, conversion drops. This is product sense, not just CSS.

---

### Cart — `client/src/app/cart.tsx`

| Upgrade | Lesson |
| --- | --- |
| Free-delivery progress bar | Gamification + clear goal (“$12 more for free delivery”) |
| Remove link + quantity stepper | Destructive and adjust actions must both be easy |
| Address + kitchen note fields | Checkout is a form, not just a total |
| Payment method chips | Selection UI > dropdowns for 2–3 options |
| Total breakdown then sticky CTA | Trust: show math before “Place order” |

**Skill:** Progress toward a threshold (free shipping/delivery) is one of the highest-ROI UX patterns in e-commerce. Implement it with a simple formula:

```ts
const freeDeliveryLeft = Math.max(0, 40 - subtotal);
const progress = Math.min(100, (subtotal / 40) * 100);
```

---

### Orders + Order detail

**Files:**
- `client/src/app/orders.tsx`
- `client/src/app/order/[id].tsx` ← **was wrongly a product screen; fixed**

| Upgrade | Lesson |
| --- | --- |
| Status badges from `ORDER_STATUS_META` | Never hard-code status colors per screen |
| Pull-to-refresh + `useFocusEffect` | Refetch when user returns to the tab/screen |
| Fixed endpoint `/api/orders/myorders` | UI polish is useless if the API path is wrong |
| Timeline stepper on detail | Orders need **narrative** (pending → delivered) |
| Reorder button | High-value retention feature from existing cart logic |

**Skill — vertical timeline pattern:**

```ts
const currentStep = ORDER_STATUS_META[status].step; // 0..3
// step index <= currentStep → filled circle + accent line
```

This same pattern works for onboarding, KYC, and shipping trackers.

**Bug class to remember:**  
`order/[id].tsx` had been a copy of product detail. File routes are not documentation — **open the file and verify the default export matches the URL**. Expo Router can’t save you from wrong content.

---

### Auth — `login.tsx` / `register.tsx`

| Upgrade | Lesson |
| --- | --- |
| Icon-prefixed fields | Visual structure reduces form anxiety |
| Show/hide password | Accessibility + fewer failed logins |
| `KeyboardAvoidingView` + ScrollView | Forms that hide under the keyboard feel broken |
| Modal presentation | Auth as overlay keeps user context |

**Skill:** Mobile forms fail for boring reasons (keyboard cover, wrong `autoCapitalize`, no secure entry). Fix those before fancy validation animations.

---

### Profile & Success

| Screen | Upgrade lesson |
| --- | --- |
| Profile | Group settings in one card; “coming soon” for unfinished items beats dead buttons |
| Success | Celebrate the moment (check pulse rings), then **one primary CTA** (“Track order”) |

**Skill:** Success screens are part of the funnel. Don’t dump the user on a dead end — always give a next action and a soft exit home.

---

## 6. Navigation & motion — `_layout.tsx`

```tsx
<Stack.Screen name="product/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
<Stack.Screen name="cart" options={{ animation: 'slide_from_bottom' }} />
<Stack.Screen name="success" options={{ animation: 'fade' }} />
```

### Why different animations?
| Transition | When to use |
| --- | --- |
| `slide_from_right` | Hierarchical navigation (Home → Orders) |
| `slide_from_bottom` / modal | Temporary tasks (product, cart, login) |
| `fade` | Outcome moments (success) where spatial slide feels wrong |

**Skill:** Motion should match **information hierarchy**, not random flair. If every screen slides the same way, the app feels flat. If every screen has a different wild animation, it feels chaotic.

---

## 7. State + UI working together

Premium UI still depends on solid state.

| Store | Role in the upgrade |
| --- | --- |
| `cartStore` | Floating cart bar, quick-add on cards, steppers, reorder |
| `authStore` | Avatar initial on Home, protected order fetches, checkout gate |

**Skill:** UI components should **read** state; screens should **decide** when to navigate after mutations.

Example flow:

```
ProductCard (+)  →  cartStore.addItem
FloatingCartBar  →  router.push('/cart')
Cart Place Order →  API  →  clearCart  →  /success
```

Keep side effects (network, navigation) out of dumb presentational bits when you can.

---

## 8. Mental model: states every screen needs

Use this checklist on every new screen you build:

```
[ ] Loading (spinner or skeleton)
[ ] Empty (friendly copy + CTA)
[ ] Error (message + retry)
[ ] Success with data
[ ] Disabled / submitting (button loading)
```

We applied this on Home (menu), Orders, Product, Cart checkout, and Auth errors.

---

## 9. File map of the UI system

```
client/src/
├── constants/
│   └── brand.ts              # tokens + status/category maps
├── components/
│   ├── ProductCard.tsx       # composite menu card
│   └── ui/
│       ├── PressableScale.tsx
│       ├── PrimaryButton.tsx
│       ├── IconButton.tsx
│       ├── Badge.tsx
│       ├── QuantityStepper.tsx
│       ├── EmptyState.tsx
│       └── FloatingCartBar.tsx
└── app/
    ├── _layout.tsx           # stack + transitions
    ├── index.tsx             # home
    ├── product/[id].tsx      # product modal
    ├── cart.tsx
    ├── orders.tsx
    ├── order/[id].tsx        # tracking + reorder
    ├── login.tsx / register.tsx
    ├── profile.tsx
    └── success.tsx
```

---

## 10. How to level up from here (practice path)

Work these in order — each one trains a real senior habit:

1. **Token audit** — Search the client for hard-coded hex colors and replace with `Brand.*`.
2. **Skeleton loaders** — Replace plain `ActivityIndicator` on Home with gray pulsing cards (same layout as `ProductCard`).
3. **Haptics** — On add-to-cart, call Expo Haptics for light impact (mobile only).
4. **Bottom tabs** — Home / Orders / Profile with a cart badge on a tab icon.
5. **Cart persistence** — Save `items` to AsyncStorage so refresh doesn’t wipe the cart.
6. **Real images** — Ensure seed products use high-quality food URLs; premium UI dies next to broken images.
7. **Accessibility** — Add `accessibilityLabel` to icon-only buttons (`IconButton`, heart, back).
8. **Design QA pass** — Use the app on a real phone for 10 minutes. Note every hesitation. Fix those first.

---

## 11. Principles to tattoo on your brain

1. **Systems beat one-off styling.** Tokens → primitives → screens.  
2. **Interaction is product.** Scale, sticky CTAs, progress bars, timelines.  
3. **Empty and error are features.** Blank screens feel like bugs.  
4. **Commerce UI protects the money path.** Cart and checkout must be the most polished flows.  
5. **Verify routes match implementations.** A beautiful wrong screen is still wrong.  
6. **Animate with purpose.** Entry, press, success — not decoration for its own sake.  
7. **Read production apps like textbooks.** Open DoorDash/Uber Eats and reverse-engineer spacing, hierarchy, and footer patterns.

---

## Notes

- Frontend needs the backend reachable from the device/emulator.
- Physical devices: check LAN IP wiring in `client/src/config/api.ts`.
- `stripe` is listed in server dependencies; payment is still stubbed (`isPaid: true` on create) — UI can look paid while payment is simulated.
- Kitchen admin is **not** created via Sign Up. Use `npm run seed:admin` in `/server`.
- Step-by-step ship docs live in [`/docs`](./docs/README.md) — prefer those over chat history when resuming work.

---

## Documentation map

| Doc | Audience |
| --- | --- |
| [README.md](./README.md) (this file) | Overview, setup, UI deep dive |
| [docs/README.md](./docs/README.md) | Ship roadmap index |
| [docs/01-kitchen-admin-board.md](./docs/01-kitchen-admin-board.md) | Step 1 — kitchen order board |
| [docs/02-menu-management.md](./docs/02-menu-management.md) | Step 2 — menu CRUD + sold out |
| [ROADMAP.md](./ROADMAP.md) | Original 30-day learning plan |

---

## Development philosophy

This project is a learning-friendly prototype with clean frontend/backend separation. Customer UI upgrades practice **design systems**. Kitchen board upgrades practice **authorization and operations**. Together they move the project from demo → sellable tool.

When you open a PR next time, ask:

> Did I add pixels — or did I improve the system?

Aim for the system.
