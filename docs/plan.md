# Local Vendor Sales Analytics MVP Plan

This document outlines the MVP plan for the **Local Vendor Sales Analytics SaaS**, designed for small shop owners and local vendors.

---

## 1. Core User Stories

*   **Authentication & Access Control**
    *   *As a new vendor*, I want to create an account with my email, password, and store name so that I can securely track my sales.
    *   *As an existing vendor*, I want to log in using my credentials so that I can access my dashboard.
    *   *As a security-conscious vendor*, I want to log out of my account when done.
    *   *As a vendor*, I must never see another vendor's sales or analytics data.

*   **Sales Entry**
    *   *As a vendor*, I want a quick-entry form to record a sale, inputting:
        *   Product name (autocomplete / datalist suggestion based on past entries)
        *   Quantity sold
        *   Unit price
        *   Payment method (Cash, UPI, Card, etc.)
        *   Date of sale (defaults to today)
        *   *Optional:* Customer Name & Customer Phone (for basic insights)
    *   *As a vendor*, I want the system to calculate the total amount automatically and store it.

*   **Analytics Dashboard**
    *   *As a vendor*, I want to see a summary of KPIs:
        *   **Total Revenue** for the selected time range.
        *   **Total Orders** (Sales Count).
        *   **Average Order Value (AOV)**.
    *   *As a vendor*, I want to see visual charts for:
        *   **Daily / Weekly / Monthly Revenue** trends.
        *   **Top Products** by revenue and quantity.
        *   **Basic Customer Insights** (e.g., Repeat Customer Rate, count of unique customers).
    *   *As a vendor*, I want to filter analytics by date ranges (Today, Last 7 Days, This Month, All Time).

*   **Onboarding & Demo Mode**
    *   *As a new vendor with empty data*, I want to click a "Seed Demo Data" button to instantly generate mock sales records so I can immediately see how the dashboard, charts, and metrics look in action.

---

## 2. Entities & Schema (SQLite Database)

We will use SQLite with Prisma ORM for a self-contained, simple database.

### Vendor (User)
*   `id`: `Int` (Primary Key, Autoincrement)
*   `email`: `String` (Unique)
*   `password`: `String` (Hashed password hash)
*   `storeName`: `String` (Vendor's store/business name)
*   `createdAt`: `DateTime` (Defaults to `now()`)

### Sale
*   `id`: `Int` (Primary Key, Autoincrement)
*   `vendorId`: `Int` (Foreign Key referencing `Vendor.id`)
*   `productName`: `String` (Name of product sold)
*   `quantity`: `Int` (Quantity sold)
*   `unitPrice`: `Float` (Price per unit)
*   `totalAmount`: `Float` (Computed as quantity * unitPrice)
*   `paymentMethod`: `String` (Constrained to: "Cash", "UPI", "Card", "Other")
*   `customerName`: `String?` (Optional)
*   `customerPhone`: `String?` (Optional)
*   `saleDate`: `DateTime` (Date of sale, defaults to `now()`)
*   `createdAt`: `DateTime` (Defaults to `now()`)

*Indexes:* An index on `(vendorId, saleDate)` will optimize analytics queries.

---

## 3. Tech Stack Decision Matrix

| Layer | Selection | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router, TypeScript) | Unified frontend and API backend in a single code base. High productivity. |
| **Styling** | Vanilla CSS + CSS Modules | Fully customized, premium typography/animations, zero Tailwind configurations or setup confirmation loops. Responsive & modern. |
| **Database** | SQLite + Prisma ORM | Zero-setup, file-based database. Highly robust, type-safe migrations. |
| **Authentication** | Custom Session Auth (JWT / encrypted cookie) | Lightweight, self-contained, no external provider accounts (like Auth0/Clerk) required. |
| **Charts** | Lightweight ChartJS or SVG Charts | Premium, responsive visual representation of trends. |

---

## 4. MVP Scope vs Future Roadmap

### In Scope for MVP:
1.  **Fully functional Vendor Sign Up / Log In** with bcrypt-hashed passwords.
2.  **Dashboard Shell** with a modern, responsive layout, sidebar, and dark/light modes.
3.  **Modern Form** to record sales with validation.
4.  **Sales History Table** to view, inspect, or delete records.
5.  **Interactive Analytics Charts** showing daily revenue trends and top products.
6.  **Demo Mode Button** that seeds 30+ sales covering various dates, payment types, and repeat customer phone numbers.

### Deferred (Deferred to Phase 2/3):
1.  **Strict Inventory Database**: Currently, products are tracked dynamically by name within the Sales records. In Phase 2, we will create a dedicated `Product` entity with stock counts and automatic low-stock notifications.
2.  **Customer Profiles & Loyalty CRM**: Dedicated customer tables tracking loyalty points and custom notes.
3.  **WhatsApp/Email Daily Reports**: Automating daily summaries sent to the shop owner's phone.
4.  **Offline-First PWA Support**: Storing sales locally in IndexDB when offline, and syncing once connection is restored.

---

## 5. Practical Workflow Considerations (Real-Shop Behavior)

*   **Rush-Hour Friction Minimization (MVP)**:
    *   **Essential Fields Only**: Only `productName`, `quantity`, and `unitPrice` are strictly required to create a sale. `paymentMethod` defaults to "Cash" (with options restricted to "Cash", "UPI", "Card", "Other") and `saleDate` defaults to "Today" to minimize inputs.
    *   **Optional Customer Profiles**: Customer name and phone number fields are optional, enabling rapid checkout without slowing down queues.
    *   **Day-End Reconciliations**: A first-class "Today" quick filter on the dashboard displays today's total revenue, order count, and a filterable sales list with inline deletion. This is designed for end-of-day review so vendors can quickly verify today's sales and fix mistakes.
    *   **Standardized Payments**: Payment methods are restricted to a constrained set (Cash / UPI / Card / Other) to support better financial insights and prevent free-text inconsistencies.

*   **Future Enhancements (Phase 2 – Fast POS)**:
    *   **Dedicated Product Catalogue & Quick Buttons**: Create a standard `Product` database and provide quick-select buttons for high-velocity items.
    *   **Camera Barcode/QR Scanning**: Integrate client-side camera barcode scanning for instant item selection.
    *   **End-of-Day Ledger Reconciliations**: Provide reports summarizing sales split by payment method (Total Cash, Total UPI, Total Card) to reconcile with the physical cash drawer.

