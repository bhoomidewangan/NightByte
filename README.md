# NightByte ☕
> Late-night fuel for the focused few.

A full-stack canteen management and ordering system with dual ordering channels — a web app and a conversational WhatsApp bot — built for a single cafe owner to manage their menu, orders, and customers in real time.

---

## Features

### Customer (Web)
- OTP-based login via WhatsApp
- Browse menu grouped by category
- Add items to cart with live total calculation
- Place orders and track status in real time via Socket.io

### Customer (WhatsApp)
- Type `Menu` to browse available items
- Type `Order` to place an order conversationally
- Type `Confirm` or `Cancel` to confirm or cancel
- Type `Update` to check current order status
- Receive automatic status updates as the owner advances the order

### Owner / Admin
- OTP-based login via WhatsApp
- Create and manage cafe profile (name, timings, enable/disable ordering)
- Full menu management — add, edit, toggle availability, delete items
- Live order notifications on dashboard via Socket.io (no refresh needed)
- Advance order status: `pending → accepted → preparing → prepared → out for delivery → delivered`
- Filter orders by status, date, or both

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-time | Socket.io |
| WhatsApp | Twilio WhatsApp API |
| Validation | express-validator |
| Frontend | React, Vite, Redux Toolkit |
| Styling | Tailwind CSS |

---

## Project Structure

```
NightByte/
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       │   ├── api.js
│       │   └── api.jsx
│       ├── assets/
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       ├── components/
│       │   ├── AdminLayout.jsx
│       │   ├── AdminRoute.jsx
│       │   ├── CustomerLayout.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── SkeletonCard.jsx
│       ├── pages/
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminMenu.jsx
│       │   ├── AdminOrders.jsx
│       │   ├── CafeSettings.jsx
│       │   ├── Cart.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Menu.jsx
│       │   ├── Orders.jsx
│       │   └── Signup.jsx
│       ├── redux/
│       │   ├── authSlice.js
│       │   ├── cartSlice.js
│       │   ├── menuSlice.js
│       │   ├── orderSlice.js
│       │   └── store.js
│       ├── App.jsx
│       ├── App.css
│       ├── main.jsx
│       ├── socket.js
│       └── index.css
├── Backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── socket.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cafeController.js
│   │   ├── menuController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── whatsappController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── validateRequest.js
│   ├── models/
│   │   ├── User.js
│   │   ├── OTP.js
│   │   ├── Cafe.js
│   │   ├── MenuItem.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   └── WhatsappSession.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cafeRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── whatsappRoutes.js
│   ├── utils/
│   │   ├── jwtUtils.js
│   │   ├── otpUtils.js
│   │   ├── whatsappService.js
│   │   ├── whatsappMessages.js
│   │   └── orderParser.js
│   ├── .env.example
│   ├── app.js
│   └── server.js
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Twilio account with WhatsApp sandbox enabled

### Backend Setup

```bash
cd nightbyte-backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/send-otp` | Public |
| POST | `/api/auth/verify-otp` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Protected |

### Cafe
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/cafe` | Public |
| POST | `/api/cafe` | Admin |
| PUT | `/api/cafe` | Admin |
| PATCH | `/api/cafe/toggle` | Admin |

### Menu
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/menu` | Public |
| GET | `/api/menu/all` | Admin |
| POST | `/api/menu` | Admin |
| PUT | `/api/menu/:id` | Admin |
| PATCH | `/api/menu/:id/toggle` | Admin |
| DELETE | `/api/menu/:id` | Admin |

### Cart
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/cart` | Customer |
| POST | `/api/cart/add` | Customer |
| POST | `/api/cart/remove` | Customer |
| DELETE | `/api/cart` | Customer |

### Orders
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/orders/place` | Customer |
| GET | `/api/orders/my-orders` | Customer |
| GET | `/api/orders` | Admin |
| PATCH | `/api/orders/:id/status` | Admin |

### WhatsApp
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/whatsapp/webhook` | Twilio |

---

## WhatsApp Ordering Flow

```
Customer texts "Menu"     → receives full menu
Customer texts "Order"    → receives item list + format instructions
Customer texts items      → receives order summary with total
Customer texts "Confirm"  → order placed, owner notified instantly
Customer texts "Cancel"   → order cancelled
Customer texts "Update"   → receives current order status
```

---

## Socket Events

| Event | Direction | Trigger |
|---|---|---|
| `new_order` | Server → Owner | Customer places an order |
| `order_status_updated` | Server → Customer | Owner advances order status |

---

## Deployment

- **Backend** — [Render](https://render.com)
- **Frontend** — [Vercel](https://vercel.com)

---

## Authors

**Khushi Khandekar** — Frontend
[@khandekarkhushhi](https://github.com/khandekarkhushhi)

**Bhoomi Dewangan** — Backend & Integration
[@bhoomidewangan](https://github.com/bhoomidewangan)

