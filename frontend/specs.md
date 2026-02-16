# 99Sellers - Master Technical Specifications

## 1. Project Overview
**Type:** Real Estate Data Terminal (B2B SaaS).
**Goal:** Search engine for "Distressed Properties" (Foreclosures, Probate, Tax Defaults).
**Target Audience:** Real Estate Investors & Agents looking for "Off-Market" deals.
**Unique Value:** "Poppins" (Instant pop-up details) + Speed + Equity Calculation.

---

## 2. Tech Stack & Architecture
* **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS (or Bootstrap utils), SCSS.
* **Backend:** Node.js (Express) or Next.js API Routes.
* **Database:** MySQL (Legacy Schemas: `proaddress` & `web_extractor2`).
* **Auth:** JWT (JSON Web Tokens).
* **Payments:** Stripe (Plans: Daily, Monthly, Quarterly).

---

## 3. Data Structure (Database Schema Rules)
*The AI MUST use these exact column names when writing SQL queries or Interfaces.*

### A. Main Leads Table (`proaddress`)
| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique Lead ID |
| `PStreetNum` | VARCHAR | Street Number (e.g., "123") |
| `PStreetName` | VARCHAR | Street Name (e.g., "Main St") |
| `Pcity`, `PState`, `Pzip` | VARCHAR | Location Data |
| `PMotiveType` | CHAR(3) | **Crucial:** See "Motive Codes" below |
| `price` | DOUBLE | Market Value / Listing Price |
| `beds`, `baths` | VARCHAR | Property Specs |
| `square_feet` | INT | SqFt Size |
| `PYearBuilt` | VARCHAR | Year Built |
| `owner_name` | VARCHAR | **Masked** for free users |
| `owner_phone` | VARCHAR | **Masked** for free users |
| `auctiondatetime` | DATETIME | For Auction Leads |

### B. Motive Codes (Lead Types)
*Map these database codes to UI Badges:*
* **PFA** = Pre-Foreclosure (Red Badge)
* **AUC** = Auction (Orange Badge)
* **PPF** = Pre-Pre-Foreclosure
* **PRO** = Probate (Purple Badge)
* **FSB** = FSBO (For Sale By Owner) (Green Badge)
* **COD** = Code Violation
* **EVC** = Eviction
* **UTX** = Unpaid Taxes
* **OFS** = Out of State Owner
* **SCL** = Seller Call / Lead

### C. Location Hierarchy (`city_county` table)
* **Logic:** When user selects a County, query this table to find associated Cities.
* **Columns:** `city`, `county`.

---

## 4. Feature Requirements

### A. The Search Terminal (`/dashboard/search`)
1.  **Filters:**
    * **Location:** State -> County (Cascading).
    * **Lead Type:** Checkboxes mapped to `PMotiveType` (e.g., "Show me PFA and PRO").
    * **Equity:** Slider `(Price - Debt)`. *Note: If Debt is missing, use Loan Amount.*
2.  **Grid Results:**
    * Show `LeadCard` component.
    * **Equity Highlight:** Calculate `(Market Value - Loan)` and display in **Green**.
    * **Badges:** Display the Motive Name (e.g., "Probate"), not the code ("PRO").

### B. "Poppins" System (Modals)
* **Inline Poppin:** Hover over a row -> Show small floating div with `owner_name` & `price`.
* **Detail Poppin:** Click row -> Open Centered Modal.
    * **Tabs:** Property Details, Financials (Loan info), Owner Contact, Comps.
* **Marketing Poppin:** If user is **Free Tier**, mask data (e.g., "J**** S****") and show "Upgrade to Unlock" button.

### C. User Dashboard
* **Saved Searches:** Save the current filter state (JSON).
* **Favorites:** Toggle `isSaved` boolean on local state/database.
* **Downloads:** CSV Export button (Disabled for Free users).

---

## 5. UI/UX Rules
* **Design Style:** "Boxy", High-Density Data (like a Bloomberg Terminal but cleaner).
* **Colors:**
    * **Primary:** Dark Blue/Black (Dashboard background).
    * **Equity:** Bright Green (`#00C853`).
    * **Alerts:** Red (Foreclosures).
* **Mobile:** Fully responsive grid (Collapses to single column cards).

---

## 6. Implementation Steps
1.  **Connect DB:** Set up Prisma or raw SQL connection to `proaddress` table.
2.  **Build API:** Create `GET /api/leads` with query params for `motive`, `county`, `min_price`.
3.  **Frontend:** Build `LeadGrid` using the `Lead` interface derived from the schema above.