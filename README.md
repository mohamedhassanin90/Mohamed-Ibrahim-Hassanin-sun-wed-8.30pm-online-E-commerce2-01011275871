# 🛒 E-Commerce API

A scalable backend application built with **NestJS** and **TypeScript** for managing an e-commerce platform. The system provides secure authentication, product and category management, shopping cart functionality, coupon management, order processing, and Stripe payment integration while following a modular architecture.

---

# 🚀 Features

### 🔐 Authentication & Authorization
- User Registration & Login
- Email Verification with OTP
- JWT Authentication
- Access & Refresh Tokens
- Role-Based Authorization (Admin & User)
- Password Hashing

### 👤 User Management
- User Profile Management
- Protected Routes

### 📦 Product Management
- Create Products
- Update Products
- Delete Products
- View Products

### 🏷️ Category & Brand Management
- Create Categories & Brands
- Update Categories & Brands
- Delete Categories & Brands
- Retrieve Categories & Brands

### 🛒 Shopping Cart
- Add Products to Cart
- Update Cart Quantity
- Remove Products from Cart
- View Cart

### 🎟️ Coupon Management
- Create Coupons
- Update Coupons
- Apply Discount Coupons

### 📦 Order Management
- Create Orders
- Update Orders
- Retrieve Orders
- Order Status Management

### 💳 Payment
- Stripe Payment Integration
- Success & Cancel Payment URLs

### 🛡️ Security
- JWT Authentication
- Route Guards
- Password Hashing
- Request Validation using Zod
- Response Interceptors
- Logger Middleware & Interceptor

---

# 🛠️ Tech Stack

- TypeScript
- NestJS
- MongoDB
- Mongoose
- JWT
- Passport.js
- bcrypt
- Zod
- Nodemailer
- Multer
- Stripe

---

# 📂 Folder Structure

```text
src/
├── DB/
│   └── Models/
│       ├── brand.model.ts
│       ├── cart.model.ts
│       ├── category.model.ts
│       ├── coupon.model.ts
│       ├── order.model.ts
│       ├── otp.model.ts
│       ├── product.model.ts
│       └── user.model.ts
│
├── common/
│   ├── enums/
│   ├── guard/
│   ├── interceptors/
│   ├── pipes/
│   ├── service/
│   │   └── payment/
│   └── utils/
│       ├── email/
│       ├── events/
│       ├── hashing/
│       └── otp.util.ts
│
├── middleware/
│   └── logger.middleware.ts
│
├── modules/
│   ├── auth/
│   ├── brand/
│   ├── cart/
│   ├── category/
│   ├── coupon/
│   ├── order/
│   ├── product/
│   └── users/
│
├── uploads/
│   ├── brands/
│   └── categories/
│
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts

test/

package.json
package-lock.json
tsconfig.json
README.md
```

---

# 📡 API Modules

| Module | Description |
|---------|-------------|
| Authentication | User Authentication & Authorization |
| Users | User Management |
| Products | Product CRUD Operations |
| Categories | Category CRUD Operations |
| Brands | Brand CRUD Operations |
| Cart | Shopping Cart Management |
| Coupons | Coupon Management |
| Orders | Order Processing & Payments |

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/kali980980/Mohamed-Ibrahim-Hassanin-sun-wed-8.30pm-online-E-commerce-01011275871.git
```

Navigate to the project directory

```bash
cd Mohamed-Ibrahim-Hassanin-sun-wed-8.30pm-online-E-commerce-01011275871
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=

DB_URI=

TOKEN_ACCESS_ADMIN_SECRET=
TOKEN_REFRESH_ADMIN_SECRET=

TOKEN_ACCESS_USER_SECRET=
TOKEN_REFRESH_USER_SECRET=

ACCESS_TOKEN_EXPIRE_IN=
REFRESH_TOKEN_EXPIRE_IN=

SALT=

EMAIL=
PASS=

STRIPE_PUBLISH_KEY=
STRIPE_SECRET_KEY=

SUCCESS_URL=
CANCEL_URL=
```

Run the development server

```bash
npm run start:dev
```

---

# 🔒 Security

- JWT Authentication
- Role-Based Authorization
- Route Guards
- Password Hashing using bcrypt
- Request Validation with Zod
- Response Interceptors
- Logger Middleware
- Environment Variables

---

# 🧪 Testing

All API endpoints were tested using **Postman**.

---

# 📌 Future Improvements

- Swagger API Documentation
- Docker Support
- Redis Caching
- CI/CD Pipeline
- Unit & Integration Testing

---

# 👩‍💻 Author

**Sara Abdelaziz**

Backend Developer

- GitHub: https://github.com/sara-abdelazizz
- LinkedIn: https://www.linkedin.com/in/sara-abdelaziz-9722b22a7/

---

# 📄 License

This project was built for learning and portfolio purposes.
