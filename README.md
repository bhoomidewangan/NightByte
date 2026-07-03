# ☕ NightByte

A modern late-night cafe ordering system built for college campuses. NightByte allows students to browse the menu, place orders, and track their order status, while providing cafe owners with a dedicated admin dashboard to manage menu items, orders, and cafe settings.

---

## ✨ Features

### 👤 Customer Panel

- OTP-based Login & Signup
- Browse Menu
- Add Items to Cart
- Update Cart Quantity
- Remove Items from Cart
- Place Orders
- View Order History
- Responsive UI
- Backend API Integration

### 👨‍💼 Admin Panel

- Admin Authentication
- Dashboard
- View Customer Orders
- Update Order Status
- Manage Menu
- Toggle Item Availability
- Add/Edit/Delete Menu Items
- Manage Cafe Settings
- Enable/Disable Ordering

---

## 🛠 Tech Stack

### Frontend

- React.js
- Redux Toolkit
- React Router DOM
- Tailwind CSS
- Axios
- React Hot Toast

### Backend (Integrated)

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- WhatsApp OTP Authentication

---

## 📂 Project Structure

```
src
│
├── api
│
├── components
│   ├── Navbar
│   ├── ProtectedRoute
│   ├── AdminLayout
│   ├── AdminRoute
│
├── pages
│   ├── Home
│   ├── Menu
│   ├── Cart
│   ├── Orders
│   ├── Login
│   ├── Signup
│   ├── AdminDashboard
│   ├── AdminMenu
│   ├── AdminOrders
│   └── CafeSettings
│
├── redux
│
└── App.jsx
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/khandekarkhushhi/NightByte.git
```

Move into the project

```bash
cd NightByte
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

---

## 🌐 Backend

This frontend communicates with a REST API backend developed separately.

The application consumes APIs for:

- Authentication
- Menu Management
- Cart
- Orders
- Cafe Settings

---

## 📌 Major Functionalities

### Authentication

- OTP Login
- JWT Authentication
- Customer & Admin Roles

### Customer

- Browse Menu
- Cart Management
- Place Order
- Order Tracking

### Admin

- Dashboard
- Menu Management
- Order Management
- Cafe Settings

---

## 🔐 Role-Based Access

### Customer

- View Menu
- Manage Cart
- Place Orders
- View Own Orders

### Admin

- Dashboard
- View All Orders
- Update Order Status
- Manage Menu
- Manage Cafe Information

---

## 💻 Future Improvements

- Revenue Analytics Dashboard
- Charts & Reports
- Search & Filters
- Order Notifications
- Image Upload for Menu Items
- Payment Gateway Integration
- Dark/Light Theme
- Mobile Optimization

---

## 👩‍💻 Author

**Khushi Khandekar**

GitHub:
https://github.com/khandekarkhushhi

---


## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
