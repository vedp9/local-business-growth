# Product Roadmap - Local Vendor Sales Analytics

This document details the feature phases following the MVP release, designed to scale the application from a simple tracker to a high-velocity Point of Sale (POS) and CRM platform.

---

## Phase 1: MVP Consolidation (Current)

*Goal: Deploy a reliable, secure single-device ledger for local shops.*
- [x] Secure Multi-vendor signup and session-based login.
- [x] Simple sales record form with client-side validity states.
- [x] Responsive layout with CSS Modules & Dark Mode support.
- [x] Dynamic KPI overview cards (Revenue, Order Counts, AOV).
- [x] Simple SVG charts for daily sales trends and top-performing items.
- [x] One-click seeder to preview dashboards with mock history.

---

## Phase 2: Fast POS & Catalogue (Productivity)

*Goal: Optimize checkout speed for busy retail hours and simplify inventory management.*

- [ ] Add Product entity and quick-select UI for top products to improve billing speed and enable inventory features.

### 1. Dedicated Product Catalogue
*   **Database Schema**: Add a `Product` entity linked to vendors.
    *   Fields: `id`, `vendorId`, `sku`, `name`, `category`, `price`, `stockCount`, `imagePath`.
*   **Relationship**: Transition `Sale` to hold a Foreign Key referencing `Product.id`.
*   **Stock Control**: Decrement `stockCount` automatically upon sale entry. Highlight low-stock products on the dashboard.

### 2. Rush-Hour Quick POS Screen
*   **Visual Grid**: A mobile-friendly dashboard viewport dominated by a grid of "Quick Select" cards for high-velocity items.
*   **Basket Workflow**: Add items to a shopping cart with single-click taps. Set quantities and custom discounts directly inside the drawer.
*   **One-tap checkout**: Submit transaction and clear basket instantly with keyboard shortcuts (e.g. `Enter` to finalize cash sale).

### 3. Camera-Based Barcode/QR Scanning
*   **Device Integration**: Use `getUserMedia` to open user-facing camera streams inside the browser.
*   **Scan Engine**: Integrate a client-side WebAssembly scanner (e.g., `@zxing/library` or native browser `BarcodeDetector` API) to detect EAN-13 barcodes.
*   **Workflow**: Point camera at product barcode -> match `sku` -> append to current basket instantly with sound cue feedback.

### 4. Day-End Cashier Ledger & Reconciliation
*   **Ledger Snapshot**: A reconciliation screen displaying total theoretical drawer figures:
    *   `Theoretical Cash = Opening Balance + Cash Sales - Cash Payouts`
*   **Manual Count**: Form for the cashier to input actual counted cash, card receipts, and UPI settlements.
*   **Discrepancy Reporting**: Generate logs detailing cash differences to prevent shop floor shrinkage.

---

## Phase 3: Connected Operations & PWAs (Scalability)

*Goal: Enable offline operations, automate notifications, and build out customer loyalty programs.*

### 1. Progressive Web App (PWA) & Offline Mode
*   **Service Workers**: Cash assets and routes locally for offline page loads.
*   **Offline Data Store**: Save sales in `IndexedDB` when network is unavailable.
*   **Auto Sync**: Listen to network state changes. Sync local transactions to PostgreSQL/SQLite servers in the background when connectivity returns.

### 2. Automated WhatsApp & SMS Summaries
*   **EOD Report Dispatch**: Set up a background cron job (using Node-cron or Firebase Functions) to query sales metrics at closing time.
*   **WhatsApp API Integration**: Send clean text summaries containing total sales, profit, top products, and AOV straight to the owner's phone via Twilio or WhatsApp Business API.

### 3. Customer Loyalty & CRM
*   **Purchase History**: Search customer profiles by phone number to display total lifetime value and frequency.
*   **Store Credit**: Let vendors track informal shop credit (balances and repayments) for regular neighborhood customers.
*   **Loyalty Points**: Set up basic rules (e.g., $1 spent = 1 point) and allow point redemption at checkout.
