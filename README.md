# 🌾 AgroChain

AgroChain is a decentralized supply chain traceability platform for agricultural produce. It tracks the journey of crops from the farm to the consumer's table, recording critical handovers, pricing, and transit parameters on a simulated blockchain ledger for absolute transparency and trust.

---

## 🚀 Key Features

* **End-to-End Traceability**: Consumers can scan QR codes or enter a Produce ID to trace the entire lifecycle of their agricultural items.
* **Role-Based Dashboards**: Custom interfaces tailored to each stakeholder:
  * **Farmer**: List new produce, set quality parameters, set pricing, and view transaction history.
  * **Distributor**: Buy produce, update transport parameters (temperature, humidity, vehicle type), and ship items.
  * **Retailer**: Purchase from distributors, check inventory, and generate consumer QR codes.
  * **Consumer**: Public interface to trace products and verify blockchain transactions.
  * **Admin**: Oversee the ecosystem, verify/deactivate users, and view the ledger block explorer.
* **Blockchain Simulation Ledger**: A secure, cryptographic ledger built from scratch featuring block mining, proof-of-work, hashes, and validation to prevent tampering.
* **Secure Authentication**: OTP-based email verification, role selection, JWT sessions, and hashed password security.
* **Dispute Resolution System**: Users can raise, view, and resolve disputes relating to produce quality or pricing discrepancies.

---

## 🛠️ Tech Stack

### Frontend
* **React.js** (Vite build system)
* **React Router Dom** (Routing)
* **Axios** (API requests with Session isolation)
* **CSS3** (Responsive, premium styling with custom animations)

### Backend
* **Node.js** & **Express.js** (REST API)
* **MongoDB** & **Mongoose** (Database)
* **JSON Web Tokens (JWT)** (Session Security)
* **BcryptJS** (Password encryption)
* **Nodemailer** (OTP & Password resets)

---

## 📂 Project Structure

```text
AgroChain/
├── backend/
│   ├── blockchain/      # Blockchain simulation ledger & smart contracts
│   ├── config/          # Database connection
│   ├── middleware/      # Auth security guard middleware
│   ├── models/          # MongoDB/Mongoose Schemas (User, Produce, Transaction, OTP, Dispute)
│   ├── routes/          # API Route controllers
│   ├── services/        # Third-party integrations (Email service)
│   ├── utils/           # Utilities
│   ├── seed.js          # Main DB seeding script
│   └── server.js        # Express application entry point
└── frontend/
    ├── src/
    │   ├── assets/      # Static assets (images, icons)
    │   ├── components/  # Shared components (Navbar, etc.)
    │   ├── context/     # Auth state context
    │   ├── pages/       # Dashboards & pages for each role
    │   ├── services/    # Axios HTTP interceptors & endpoints
    │   └── main.jsx     # Frontend entry point
```

---

## ⚙️ Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed and running on your local machine.

### 1. Database Seeding
To populate the database with ready-to-test accounts, transactions, and blockchain simulation logs:
```bash
cd backend
node seed.js
```

### 2. Run the Backend
From the `backend` directory, install dependencies and start the hot-reloading development server:
```bash
npm install
npm run dev
```
*The server will run on `http://localhost:5000`.*

### 3. Run the Frontend
From the `frontend` directory, install dependencies and start the development server:
```bash
cd ../frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🔑 Test Credentials
To simplify testing, use the following seeded accounts (all passwords are `password123`):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@agrochain.com` | `password123` |
| **Farmer 1** | `farmer@agrochain.com` | `password123` |
| **Farmer 2** | `farmer2@agrochain.com` | `password123` |
| **Distributor** | `distributor@agrochain.com` | `password123` |
| **Retailer** | `retailer@agrochain.com` | `password123` |
| **Consumer** | `consumer@agrochain.com` | `password123` |
