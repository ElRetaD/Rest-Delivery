# 🍽️ La Canyada — Restaurant Delivery & Operations Platform

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101.svg?logo=socket.io)](https://socket.io/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900.svg?logo=leaflet)](https://leafletjs.com/)
[![License: Proprietary](https://img.shields.io/badge/License-All_Rights_Reserved-red.svg)](LICENSE)

A production-grade, full-lifecycle restaurant ordering and operations management ecosystem built for modern food-tech. This repository houses the front-facing web client and the real-time administration dashboard.

---

## 🏗️ Architecture & Modules

The platform is structured into decoupled, high-performance web applications:

```
Rest-Delivery/
├── rest-client/     # Customer-Facing Web App (Ordering, Cart, Live GPS Tracking)
└── rest-webs/       # Operations & Kitchen Management Dashboard (Admin ERP, Real-Time Fleet Map)
```

### 1. 📱 Customer Web App (`/rest-client`)
A high-converting, mobile-first web application designed for seamless customer ordering:
- **Interactive Menu:** Categorized food catalog with customization options, real-time dish availability, and stock statuses.
- **Cart & Checkout Engine:** Dynamic order calculation, supplement selection, and strict client validation for delivery addresses and phone numbers.
- **Live Order Tracking:** Real-time courier tracking powered by WebSocket bidirectional updates and interactive maps.
- **Customer Portal:** Profile management, order history, and instant support issue reporting.

### 2. 📊 Admin & Operations ERP (`/rest-webs`)
A real-time command center for kitchen staff, managers, and dispatchers:
- **Live Dispatcher Map:** Real-time geolocation tracking of active couriers with delivery routes via Leaflet / OpenStreetMap.
- **Real-Time Order Kanban:** Zero-refresh state machine management (`New` ➔ `Preparing` ➔ `Ready` ➔ `Delivering` ➔ `Completed`).
- **Menu & Pricing Engine:** Full CRUD menu management with image uploads, dietary tags, allergens, and price tiers.
- **Financial Analytics & Reports:** Interactive daily/monthly revenue graphs, top-selling dishes, and courier cash settlement ledger.
- **Multilingual Support:** Built-in internationalization (French, Arabic, Spanish).

---

## ⚡ Tech Stack & Core Libraries

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite (Ultra-fast HMR & optimized production bundling) |
| **Real-Time Layer** | Socket.IO Client (Auto-reconnection, room multiplexing, ping health checks) |
| **Geospatial & Maps** | Leaflet, OpenStreetMap, Custom SVG Markers, Polylines |
| **Styling & Design** | Vanilla CSS Design System, Glassmorphism, Dark Mode, Micro-animations |
| **Data Visualization** | Chart.js, Canvas rendering for revenue & sales analytics |
| **State & Networking** | React Context API, Axios (Interceptors, auth token rotation, 30s resilience timeouts) |
| **Security** | Zero-Trust input sanitization, Phone Regex validation, strict CORS policies |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm or yarn

### 1. Running the Customer Web App
```bash
cd rest-client
npm install
npm run dev
```
Access the client app at `http://localhost:5173`.

### 2. Running the Admin Dashboard
```bash
cd rest-webs
npm install
npm run dev
```
Access the admin dashboard at `http://localhost:5174`.

### Environment Configuration
Both applications provide `env.example` templates. To connect to your backend:
```bash
# rest-client/.env or rest-webs/.env
VITE_API_URL=https://your-backend-api.com/api
VITE_SOCKET_URL=https://your-backend-api.com
```

---

## 🔒 Security & Intellectual Property

- **Backend & Database:** The backend REST API, database schemas, and courier mobile application (Flutter) are maintained in private infrastructure repositories.
- **License:** All source code in this repository is proprietary and copyrighted. See [LICENSE](LICENSE) for terms.

---

## 👨‍💻 Author

Developed with ❤️ by **ElRetaD**
* Portfolio & GitHub: [@ElRetaD](https://github.com/ElRetaD)
