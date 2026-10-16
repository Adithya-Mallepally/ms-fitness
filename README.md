# M S Fitness Management System

A production-ready gym operations and membership management platform built with Next.js, TypeScript, Tailwind CSS, Prisma ORM, and Supabase PostgreSQL.

Live Application: https://ms-fitness-club.netlify.app

---

## System Overview

The M S Fitness Management System is a centralized web platform designed for luxury gym facilities and fitness centers. It manages front-desk check-ins, member profiles, subscription validity, renewal schedules, financial ledgers, digital tax receipts, and member self-service portals.

The platform provides role-focused interfaces for administrative staff and members:
- Front-desk staff use a streamlined attendance terminal with static prefix member lookup, real-time admission verification, and shift logging.
- Administrators oversee active memberships, track approaching lapses, adjust plan pricing with version tracking, record payments, and export financial audit reports.
- Gym members access a personal portal to view their membership validity, review monthly attendance calendars, and display dynamic entrance passes.

---

## Technical Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript 5
- Styling: Tailwind CSS
- Typography: Inter from rsms.me (configured globally across all elements)
- ORM: Prisma 5.22.0
- Database: PostgreSQL hosted on Supabase with PgBouncer connection pooling
- Deployment: Netlify with AWS Lambda serverless execution and edge caching
- Audio Feedback: HTML5 Web Audio API synthesizer for desk status tones

---

## Key Modules and Features

### 1. Attendance and Check-In Terminal
- Route: /admin/attendance
- Member Code Flow: The terminal keeps the prefix "MSF-" static and non-editable. Staff enter only the 4-digit numeric code (such as 1001).
- Instant Verification: Submitting the 4-digit code fetches member details, evaluates membership expiration, and marks attendance in a single operation.
- Access Status Indicators:
  - Access Granted (Green): Active pass with valid remaining days.
  - Expiring Soon (Amber): Active pass expiring within 7 calendar days.
  - Access Restricted (Red): Expired or inactive pass. Staff can perform a manual override or initiate an immediate renewal.
- Shift Tracking: Check-ins are categorized into Morning (5:00 AM to 11:59 AM), Evening (4:00 PM to 10:59 PM), or General hours.
- Duplicate Detection: Flags repeated check-ins on the same calendar day with total visit counters.
- Live Table Feed: Searchable and filterable attendance feed with one-click CSV export.

### 2. Member Portal and Digital Pass
- Route: /portal
- Lookup: Members can look up their profile using their registered 10-digit mobile number or their member code.
- Attendance Calendar: Monthly calendar view detailing daily attendance records, active streaks, consistency percentages, and total lifetime visits.
- Dynamic Entrance Pass: Client-side cryptographic QR pass refreshed every 5 minutes with unique nonces to prevent unauthorized screenshot sharing.
- Transaction History: Complete payment archive allowing members to view and print official tax receipts.

### 3. Member Directory and New Registration
- Routes: /admin/members and /admin/members/new
- Validation: Prevents duplicate mobile numbers across registrations.
- Member Code Generation: Assigns incremental sequential identifiers starting from MSF-1001.
- Plan Assignment: Automatically calculates the membership expiration date based on the plan duration (inclusive calendar-day policy).

### 4. Promotional Discount Coupon System
- Static Storage: Promotional discount vouchers are statically maintained with percentage discounts:
  - MSF10: 10 percent discount
  - MSF15: 15 percent discount
  - MSF20: 20 percent discount
  - MSF25: 25 percent discount
  - MSF30: 30 percent discount
  - MSF35: 35 percent discount
  - MSF40: 40 percent discount
- Interface: Visible coupon display cards with one-click copy and apply buttons.
- Real-Time Recalculation: Instantly recalculates base fee, discount amount, and net payable balance. Discount details are permanently saved with payment records and displayed on tax receipts.

### 5. Membership Renewals Management
- Route: /admin/renewals
- Terminology: Universal renewal tracking replacing complicated pipeline terminology.
- Queue Segmentation:
  - Urgent: Passes expiring within 7 days.
  - 30-Day Window: Passes expiring within 30 days.
  - Lapsed / Expired: Overdue memberships requiring follow-up.
- One-Click Renewal: Extends validity from the current expiration date while recording a new transaction in the ledger.

### 6. Payment Ledger and Receipt Printing
- Route: /admin/payments
- Payment Recording: Logs payments via UPI, Cash, Card (POS), and Bank Transfer (IMPS/NEFT) with optional transaction reference identifiers.
- Print-Engine Architecture:
  - Fixed print styles in CSS isolating the receipt content to fit cleanly on standard A4 paper.
  - Eliminates overflow, page clippings, and obscured text.
  - Displays member name, member ID, phone, email, category, plan name, term duration, validity dates, payment method, transaction reference, receipt number, date, itemized pricing, applied discounts, and net total.

### 7. Financial and Operational Reporting
- Route: /admin/reports
- KPI Aggregates: Total active members, revenue aggregate, term distribution, and shift volume.
- Data Export: Generates downloadable CSV audit files containing member, payment, and attendance records.

---

## Data Models and Architecture

The application uses Prisma ORM connected to PostgreSQL. The schema is organized around the following core models:

- Member: Stores profile details including memberCode, firstName, lastName, phone, email, gender, status, and staff notes.
- MembershipPlan: Defines package options, category (MEN, WOMEN, COUPLE), and duration in calendar months.
- PlanPrice: Maintains timestamped price records with version increments to ensure historical reporting remains accurate when pricing changes.
- Membership: Associates a member with a specific plan and price version, tracking startDate, endDate, amountPaid, and status.
- Payment: Contains financial transaction records including receiptNo, amount, paymentMethod, transactionRef, status, paidAt, and notes.
- Attendance: Tracks physical check-in events with dateString, checkInAt, shift, status, and verifiedBy method.
- ClubSetting: Stores administrative key-value configurations such as gym operating hours.
- AuditLog: Records administrative mutations for compliance and accountability.

---

## API Reference

### Attendance APIs
- POST /api/attendance/scan: Validates member code or QR payload, verifies pass validity, and records attendance. Accepts qrData, verifiedBy, and allowOverride.
- GET /api/attendance/today: Returns today's check-in logs and shift summary counts.
- POST /api/attendance/manual: Performs a manual desk check-in using member ID.
- GET /api/attendance/export: Streams a CSV file containing attendance records for the selected date range.

### Portal APIs
- GET /api/portal/lookup: Searches for a member profile by mobile number or member code. Returns memberships, payments, and attendance history.

### Admin APIs
- GET /api/admin/plans: Lists all active membership plans with their latest price versions.
- POST /api/admin/plans/update-fee: Creates a new price version for an existing plan without altering historical records.
- POST /api/admin/members/new: Registers a new member, creates their initial membership, logs payment, and generates a tax receipt.
- POST /api/admin/members/[id]/renew: Processes an immediate membership renewal and issues a new receipt.
- GET /api/admin/reports/export: Generates a CSV export of payments and financial transactions.

---

## Getting Started

### Prerequisites
- Node.js version 18.18.0 or later
- npm or yarn
- Access to a PostgreSQL instance (such as Supabase)

### Installation

1. Clone the repository:
   git clone https://github.com/Adithya-Mallepally/ms-fitness.git
   cd ms-fitness

2. Install dependencies:
   npm install

3. Configure environment variables:
   Create a .env file in the root directory with the following variables:

   DATABASE_URL="postgresql://user:password@host:5432/postgres"
   DIRECT_URL="postgresql://user:password@host:5432/postgres"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

4. Generate Prisma Client and apply database schema:
   npx prisma generate
   npx prisma db push

5. Start the development server:
   npm run dev

   The application will be accessible at http://localhost:3000.

---

## Testing and Verification

The project includes an automated end-to-end test suite verifying 35 distinct functional requirements across 5 test suites:

- Suite 1: Static TypeScript type checking and Prisma schema validation.
- Suite 2: Domain logic and calendar-day expiry calculations.
- Suite 3: Database schema and seed data integrity.
- Suite 4: End-to-end API integration tests (registration, scan, renewal, portal lookup, payments, reporting).
- Suite 5: Server-side rendering (SSR) health checks across all public and administrative routes.

To execute the test suite:
npm test

To execute tests against a specific environment:
BASE_URL="https://ms-fitness-club.netlify.app" npm test

---

## Deployment Configuration

The application is deployed on Netlify utilizing the Next.js Runtime plugin. Key configuration details:

- Build Command: npx prisma generate && npx prisma db push && next build
- Publish Directory: .next
- Serverless Target: AWS Lambda with Linux OpenSSL 3.0 runtime
- Prisma Generator Binary Targets: ["native", "rhel-openssl-3.0.x", "debian-openssl-3.0.x"]
- Database Pooling: Transactions pooled via Supabase PgBouncer (port 6543) for connection scalability under serverless workloads.

---

## License

This software is developed for M S Fitness Club. All rights reserved.
