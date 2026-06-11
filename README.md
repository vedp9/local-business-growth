# Local Vendor Sales Analytics SaaS MVP

A full-stack sales tracking and analytics Web Application designed for small shop owners and local vendors. It replaces physical paper notebooks with a secure, modern, and rapid ledger that works on any device.

---

## 🚀 Key Features (MVP)

*   **Multi-Vendor Secure Auth**: Custom, lightweight session-based cookie authentication (JWT) with secure multi-vendor database isolation (each shop owner only accesses their own records).
*   **Rush-Hour Sales Billing**:
    *   **Essential Fields Only**: Only product name, quantity, and unit price are required.
    *   **Intelligent Autocomplete**: Dynamic product name dropdown using history inputs.
    *   **Standardized Payments**: Restricts payment entries to a set list (`Cash`, `UPI`, `Card`, `Other`) defaulting to `Cash`, preventing database text duplicates and preparing for deep payment split analytics in Phase 2.
    *   **Fast Inputs**: Date defaults to "Today" and customer name/phone are optional.
*   **Interactive Analytics Dashboard**:
    *   **Summary Cards**: Quick view of Gross Revenue, Total Sales Count, and Average Order Value (AOV).
    *   **"Today" Reconcile Filter**: A first-class "Today" filter button on the dashboard that isolates today's total revenue, order count, and sales lists, enabling vendors to verify cash drawers, audit records, or delete errors easily at closing time.
    *   **Visual Chart Displays**: Pure SVG responsive charts showing 7-day revenue trend graphs and top-selling product breakdowns without heavy bundle packages.
*   **🌱 Seeder Mode**: A "Seed Demo Data" utility that generates 30 days of dense sales data (including repeat customers and payment splits) to immediately preview the analytics in action.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 16 (App Router & TypeScript)
*   **Database**: SQLite Database file (dev.db)
*   **ORM**: Prisma ORM v5 (Client generation & schema management)
*   **Styling**: Vanilla CSS & CSS Modules (Fluid transitions, glassmorphic UI, color scheme support)
*   **Session Management**: JSON Web Tokens (JWT) inside secure HTTP-only cookies

---

## 📦 Scaffolding Setup & Installation

Follow these steps to run the application locally on your machine:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database & Migrations
Prisma will create a local SQLite database (`dev.db`) and configure tables:
```bash
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser to view the application.

---

## 🧪 Seeding & Test Flow

1.  Open the app and click **Sign up here** to create a fresh shop account.
2.  Upon redirecting to the empty dashboard, click **Seed Demo Data** in the top controls.
3.  The dashboard will instantly load 30 days of mock sales, populating the KPI summary cards, the Weekly Sales Trend bar chart, the Top Products chart, and the History ledger.
4.  Toggle **Today** filter to see today's specific reconciliation drawer, insert a mock sale using the quick POS form, or press 🗑️ to delete a transaction.

---

## 📸 Screenshots

*   **Vendor Log In Panel**: docs/assets/screenshot-login.png
*   **Interactive Analytics Dashboard**: `docs/assets/screenshot-dashboard.png`
*   **Sales Entry & Ledger Views**: `docs/assets/screenshot-pos.png`

---

## 🗺️ Product Roadmap

*   [ ] **Phase 2: Fast POS & Catalogue (Billing Speed)**
    *   Add Product catalog table and quick-select visual item grids.
    *   Camera-based device barcode scanning.
    *   Opening cash drawer ledger and difference auditing reports.
*   [ ] **Phase 3: PWAs & Operations (Connected Shop)**
    *   Service Worker cache and IndexedDB offline transaction sync.
    *   Automated End-Of-Day WhatsApp and email status summaries.
    *   Customer CRM profile ledger and loyalty score credit tracker.
