# Product Brainstorming & Edge Cases

This document captures product features, architectural considerations, and potential edge cases to explore in subsequent phases of the Local Vendor Sales Analytics platform.

---

## 1. Retail Edge Cases to Handle

*   **Internet Dropout (Offline Resiliency)**
    *   *Problem*: A shop owner loses connectivity during a busy rush-hour queue.
    *   *Solution*: Store pending sales in the browser's `localStorage` or `IndexedDB`. When the browser detects that `navigator.onLine` returns to `true`, sync the cached payload queue to the API in the background. Show an "Offline - changes will sync later" indicator to reassure the vendor.
*   **Currency Precision & Round-off Limits**
    *   *Problem*: Dealing with decimal precision in local currencies (e.g. $.99 vs $.00 or paisa rounding in India).
    *   *Solution*: Enforce strict rounding logic. For cash transactions, provide a "Round Off" field so the cashier can reconcile actual cash taken (e.g. rounding $14.98 to $15.00) without skewing database totals.
*   **Split Payments**
    *   *Problem*: Customer pays partially in Cash and partially in UPI.
    *   *Solution*: Allow adding multiple payment methods to a single Sale record (e.g., Cash: $5.00, UPI: $10.00) in the schema, rather than binding the transaction to a single selection.
*   **Refunds & Void Transactions**
    *   *Problem*: Customer returns an item, or a clerk records a transaction by mistake and needs to cancel it.
    *   *Solution*: Create a "Void" status column on the `Sale` table. Voiding a transaction should mark it as cancelled, exclude it from standard revenue KPIs, but preserve the record in the logs for audit control (preventing internal employee fraud).

---

## 2. Security & Role Management (Future Expandability)

*   **Owner vs. Cashier Roles**
    *   *Problem*: Staff cashiers might try to delete or void sales to steal cash from the drawer.
    *   *Solution*: Introduce role-based access.
        *   **Owner**: Has full ledger access, can delete entries, seed data, view multi-month visual analytics, and export CSVs.
        *   **Cashier**: Can only access the sales entry form and see a list of sales *they* recorded today. Cannot delete or edit historic records.
*   **Device Fingerprinting**
    *   *Problem*: Ensuring that only devices inside the physical shop can register sales.
    *   *Solution*: Bind sessions to local network IPs or allow owners to authorize specific device tokens via a QR code scan.

---

## 3. Localization & Regional Expansion

*   **Language Localizations**
    *   Target local, non-technical micro-merchants who are comfortable in regional languages (e.g. Hindi, Spanish, Vietnamese). Provide simple language switches on the dashboard.
*   **Flexible Currency Formatting**
    *   Auto-format currency symbols and decimal formats based on the shop's registered country (e.g., formatting in USD `$10.00` vs Indian Rupees `₹10.00` or Vietnamese Dong `10.000 ₫`).
*   **WhatsApp Invoice Receipts**
    *   A post-billing flow where typing a customer's phone number sends a receipt text automatically on WhatsApp, replacing paper printer hardware entirely.
