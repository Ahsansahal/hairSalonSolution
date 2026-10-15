# Project Requirements: Multi-Branch Salon Management System

## 1. Executive Summary

The **Multi-Branch Salon Management System** is a production-grade, multi-tenant, multi-branch platform engineered for a salon business currently operating a primary flagship branch with planned expansion to multiple branches and support for independent salon tenants.

## 2. Core Business Objectives

1. **Centralized Multi-Branch Ownership & Governance**: Enable the Business Owner to oversee all branches from a unified dashboard, compare branch performance, and add new branches dynamically without code or schema changes.
2. **Branch-Isolated Operations**: Restrict branch managers, receptionists, and staff members to their authorized branch(es) with fine-grained role-based access control (RBAC).
3. **Omnichannel Appointment Booking**: Provide customers with frictionless online booking via a responsive web portal and WhatsApp Business conversational flow, backed by a shared conflict-free availability and reservation engine.
4. **Workforce, Scheduling & Biometric Attendance**: Manage staff profiles, skills/services, branch assignments, operating hours, shifts, breaks, leave/time-off, and biometric attendance synchronization with human-in-the-loop adjustment approvals.
5. **Financial Integrity, Payroll, Commissions & Inventory**: Track services and retail inventory, branch stock ledgers, purchase orders, invoices, split payments, refunds, cash register sessions, expenses, and configurable staff salary/commission payroll runs.

## 3. Target User Roles

| Role | Code | Scope | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `PLATFORM_ADMIN` | Global / All Tenants | Manages platform configuration, tenant provisioning, and authorized support operations. |
| **Business Owner** | `BUSINESS_OWNER` | Tenant (All Branches) | Configures business settings, creates branches, manages all staff/services/finances across branches. |
| **Branch Manager** | `BRANCH_MANAGER` | Assigned Branch(es) | Oversees daily branch operations, staff schedules, attendance approvals, inventory, and branch reports. |
| **Receptionist** | `RECEPTIONIST` | Assigned Branch(es) | Manages appointments, walk-ins, customer check-ins, invoicing, payments, and cash register sessions. |
| **Staff Member** | `STAFF_MEMBER` | Assigned Branch(es) (Self) | Views personal schedule, assigned appointments, personal attendance logs, and commission summaries. |
| **Accountant** | `ACCOUNTANT` | Tenant / Assigned Branch(es) | Audits invoices, payments, refunds, expenses, payroll runs, and financial reports. |
| **Customer** | `CUSTOMER` | Public / Self | Books, reschedules, and cancels personal appointments via Website or WhatsApp; views booking history. |

## 4. Functional Requirements by Domain

### 4.1 Organization & Access Control
- Multi-tenant data model (`Tenant`) with one-to-many physical `Branch` locations.
- Users can hold different roles at different branches via `UserBranchRole`.
- Comprehensive immutable `AuditLog` recording actor, tenant, branch, entity, action, and JSON diff.

### 4.2 Services, Catalog & Staff Scheduling
- Master `Service` definitions per tenant with default duration, buffer time, and base price.
- `BranchService` overrides allowing branch-specific pricing, duration, and active availability.
- `StaffProfile` linked optionally to a `User` login, assigned to one or more branches (`StaffBranchAssignment`) and qualified for specific services (`StaffService`).
- Branch `OperatingHours` per weekday, `StaffShift` schedules, and `StaffTimeOff` / breaks.

### 4.3 Customer Booking & Appointment Management
- Public customer booking flow: Branch selection -> Multi-service selection -> Staff preference (specific staff or "Any Available") -> Real-time slot calculation -> Customer details & communication consent -> Instant confirmation.
- Concurrency-safe booking engine preventing double-booking of staff members via database transactions, row locking, and overlap validation (including buffer times and active `BookingHold` records).
- Lifecycle management: `PENDING`, `CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW` with full `AppointmentStatusHistory`.
- Walk-in creation, rescheduling, and cancellation policy enforcement.

### 4.4 WhatsApp Conversational Booking
- Shared scheduling engine powering WhatsApp webhook conversations.
- Stateful session tracking (`WhatsAppSession`) guiding customers through branch, service, staff, date/time, and confirmation steps.
- Webhook signature verification, idempotent event deduplication (`WebhookEvent`), outbound/inbound `MessageLog` tracking, and testable simulation mode when live Meta credentials are not configured.

### 4.5 Biometric Attendance & Payroll
- Provider-neutral biometric device registry (`BiometricDevice`), employee badge/device ID mapping, and sync run tracking (`DeviceSyncRun`).
- Deduplicated `RawAttendanceEvent` ingestion (via webhook/middleware push or CSV/JSON batch import).
- `AttendanceSummary` daily calculation with `AttendanceAdjustment` request and manager approval workflow.
- Configurable `SalaryRule`, `CommissionRule`, and auditable `PayrollRun` / `PayrollItem` generation.

### 4.6 Inventory, Billing & Accounting
- Product and consumable catalog (`Product`), `BranchInventory` stock levels, and immutable `StockMovement` ledger.
- `Supplier` and `PurchaseOrder` management.
- `Invoice`, `InvoiceItem`, `Payment` (supporting split payments across cash, card, transfer, wallet), `Refund`, `Expense`, and `CashRegisterSession`.
- Strict separation of invoiced revenue, collected payments, refunds, expenses, and payroll/commission liabilities.

## 5. Documented Assumptions & Unresolved External Decisions

1. **Database Portability for Local Dev**: PostgreSQL is the primary production database configured in `docker-compose.yml` and via `DATABASE_URL`. When Docker/PostgreSQL is not running locally on a developer machine, the Django settings gracefully support SQLite so tests and local verification run immediately without external blockers.
2. **Biometric Hardware Protocol**: Since the exact hardware model (e.g., ZKTeco, Suprema, Hikvision, or cloud relay) is not yet finalized, the backend provides a standardized REST ingestion & CSV/JSON batch import API (`/api/v1/attendance/events/ingest/`) with device token verification and event deduplication. No raw biometric templates (fingerprints/faces) are stored.
3. **WhatsApp Business Provider**: Designed for Meta Cloud API (WhatsApp Business Platform) with configurable `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, and `WHATSAPP_ACCESS_TOKEN`. Includes an interactive webhook simulator endpoint and UI panel for local end-to-end verification prior to live Meta Business verification.
4. **Tax & Payroll Jurisdiction**: Tax rates and payroll deductions are parameterized per tenant/branch rather than hardcoded to a single country's tax law.
