# RentalCnct 🔄

RentalCnct is a peer-to-peer rental marketplace designed as an **"Airbnb for products"**. Renter communities can browse, search, and book equipment locally, while asset owners can list products, track earnings, and handle handovers with secure refundable deposit calculations.

🚀 **Live Demo URL**: [https://rental-cnct.vercel.app](https://rental-cnct.vercel.app)

---

## 🚀 Tech Stack

### Frontend
- **React.js** (Vite template)
- **Tailwind CSS** (Utility-first styling, Glassmorphism, and responsive screens)
- **React Router v7** (Secure route guarding)
- **Axios** (API communications client with JWT auto-inject request interceptors)
- **Framer Motion** (Micro-animations and page transitions)
- **Lucide Icons**

### Backend
- **Spring Boot 3.3.x**
- **Spring Security** (Stateless JWT Authentication filter)
- **Spring Data JPA & Hibernate**
- **H2 Database** (Embedded zero-config database with a web console at `/h2-console`)
- **REST APIs**

---

## 📂 Project Architecture

```
RentalConnect/
├── backend/
│   ├── pom.xml                                   # Maven Dependencies
│   └── src/main/java/com/rentalconnect/
│       ├── BackendApplication.java               # Main Boot entry
│       ├── config/                               # Security, JWT, CORS configurations
│       ├── controller/                           # REST API Endpoints
│       ├── dto/                                  # Data Transfer Objects
│       ├── entity/                               # JPA Tables
│       ├── repository/                           # JPA Database queries
│       └── loader/
│           └── DataLoader.java                   # Prepopulated Seed Data (Startup runner)
└── frontend/
    ├── package.json
    ├── tailwind.config.js                        # Custom colors and dark theme scales
    ├── postcss.config.js
    ├── index.html                                # Typography & SEO meta tags
    └── src/
        ├── main.jsx
        ├── index.css                             # Tailwind directives & glassmorphic classes
        ├── App.jsx                               # Router configuration
        ├── context/                              # Auth, Theme, and Toast Notification Contexts
        ├── components/                           # Navbar, Footer, ProductCard, SearchBar, Map mockup
        ├── pages/                                # Landing, Details, Login, Register, Dashboards, Chat
        └── services/
            └── api.js                            # Axios interceptor configurations
```

---

## 📝 Seed Accounts for Testing

The database automatically seeds the following credentials on startup:

| Role | Username | Password | Full Name / Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `password123` | System Administrator |
| **Renter** | `renter` | `password123` | John Doe (General renter) |
| **Seller 1** | `alex` | `password123` | Alex Rivera (Photography & Drones) |
| **Seller 2** | `sarah` | `password123` | Sarah Jenkins (Outdoors & Cycles) |
| **Seller 3** | `david` | `password123` | David Chen (Electronics & Laptops) |
| **Seller 4** | `elena` | `password123` | Elena Rostova (Generators & Power Tools) |
| **Seller 5** | `marcus` | `password123` | Marcus Vance (Guitars & Audio Speakers) |

---

## ⚙️ Running the Application Locally

### Step 1: Start the Spring Boot Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Build and run using the Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The server starts on port `8080`.*
   - H2 Web Console URL: `http://localhost:8080/h2-console`
     - JDBC URL: `jdbc:h2:mem:rentalconnectdb`
     - Username: `sa`
     - Password: `password`

### Step 2: Start the React Frontend

1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The application starts on `http://localhost:5173`.*

---

## 🔌 API Endpoints Overview

| Component | Endpoint | HTTP Method | Auth Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| **Auth** | `/api/auth/register` | `POST` | No | Creates and signs in a new user |
| **Auth** | `/api/auth/login` | `POST` | No | Authenticates user, returns JWT token |
| **Auth** | `/api/auth/me` | `GET` | Yes | Retrieves current user session profile |
| **Users** | `/api/users/profile` | `PUT` | Yes | Updates phone, name, and avatar settings |
| **Users** | `/api/users/addresses` | `GET`/`POST` | Yes | Lists and adds address logs |
| **Products** | `/api/products` | `GET` | No | Searches and filters approved listings |
| **Products** | `/api/products` | `POST` | Yes | Creates a new listing |
| **Bookings** | `/api/bookings` | `POST` | Yes | Confirms booking, calculates pricing |
| **Bookings** | `/api/bookings/my-rentals` | `GET` | Yes | Lists active rentals for current renter |
| **Bookings** | `/api/bookings/owner-rentals`| `GET` | Yes | Lists orders requested for owner's items |
| **Bookings** | `/api/bookings/{id}/status` | `PUT` | Yes | Performs handover updates or refunds |
| **Chats** | `/api/chats` | `POST`/`GET` | Yes | Creates chat room, retrieves chat threads |
| **Admin** | `/api/admin/stats` | `GET` | Yes (Admin) | Platform analytics (revenue, categories) |

---

## 🛡️ Trust & Checkout Simulations

1. **Refundable Deposit Calculator**: The app dynamically counts `Rental Days` * `Daily Rate` + `Security Deposit` automatically.
2. **Interactive Mock Checkout**: Supports choosing Stripe (renders card inputs), Razorpay (simulates network callback loaders), and UPI (creates a real QR code scan overlay).
3. **P2P Chat Auto-Replies**: Chat with owners inside the app. When you send messages to dummy sellers (e.g. asking about availability or discounts), you receive immediate context-specific answers.
