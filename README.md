# NightByte ☕
> Late-night fuel for the focused few.

A full-stack canteen management and ordering system with dual ordering channels — a web app and a conversational WhatsApp bot — built for a single cafe owner to manage their menu, orders, and customers in real time.

---

## Features

### Customer (Web)
- OTP-based login via WhatsApp
- Browse menu grouped by category
- Add items to cart with live total calculation
- Pay securely via Cashfree payment gateway
- Track order status in real time via Socket.io

### Customer (WhatsApp)
- Type `Menu` to browse available items
- Type `Order` to place an order conversationally
- Type `Confirm` to receive a Cashfree payment link
- Type `Paid` after completing payment to confirm order
- Type `Cancel` to cancel a pending order
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
| Payment | Cashfree Payment Gateway |
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
│       │   ├── PaymentStatus.jsx
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
│   │   ├── paymentController.js
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
│   │   ├── PendingPayment.js
│   │   └── WhatsappSession.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cafeRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── whatsappRoutes.js
│   ├── utils/
│   │   ├── cashfreeService.js
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
- Cashfree account (sandbox for testing)

### Backend Setup

```bash
cd Backend
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

## Environment Variables

```env
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=10
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
OWNER_PHONE=+91XXXXXXXXXX
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_ENV=sandbox
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
PORT=5000
NODE_ENV=development
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
| GET | `/api/orders/my-orders` | Customer |
| GET | `/api/orders` | Admin |
| PATCH | `/api/orders/:id/status` | Admin |

### Payment
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/payment/initiate` | Customer |
| POST | `/api/payment/verify` | Customer |
| POST | `/api/payment/webhook` | Cashfree |

### WhatsApp
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/whatsapp/webhook` | Twilio |

---

## Web Ordering Flow

```
Customer browses menu → adds items to cart
→ clicks "Pay & Place Order"
→ Cashfree checkout opens
→ payment completed
→ redirected to /payment/status
→ order created, owner notified via Socket.io
```

## WhatsApp Ordering Flow

```
Customer texts "Menu"     → receives full menu
Customer texts "Order"    → receives item list + format instructions
Customer texts items      → receives order summary with total
Customer texts "Confirm"  → receives Cashfree payment link
Customer pays via link    → texts "Paid" to confirm
Order created             → owner notified via Socket.io
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

