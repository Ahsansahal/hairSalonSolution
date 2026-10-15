# API Design Specification: Multi-Branch Salon Management System

## 1. API Standards & Conventions

- **Base Path**: `/api/v1/`
- **Authentication**: Bearer JWT (`Authorization: Bearer <access_token>`) via `djangorestframework-simplejwt`. Public endpoints (`/api/v1/public/...` and `/api/v1/webhooks/...`) do not require staff JWTs.
- **Branch Context**: Endpoints accept `?branch_id=<uuid>` query filter or `branch` field in payload. Server permissions verify that the authenticated user is authorized for the requested `branch_id`.
- **OpenAPI Schema**: Auto-generated at `/api/schema/` and interactive Swagger UI at `/api/docs/`.
- **Error Format**: Consistent JSON structure `{"detail": "...", "errors": {...}}` with appropriate HTTP status codes (`400`, `401`, `403`, `404`, `409`).

## 2. Core Endpoints Reference

### 2.1 Authentication & Organization
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login/` | Public | Authenticate with email & password; returns JWT tokens + user profile & branch roles. |
| `POST` | `/api/v1/auth/refresh/` | Public | Refresh access token. |
| `GET` | `/api/v1/auth/me/` | Authenticated | Current user profile, tenant details, and authorized branches/roles. |
| `GET, POST` | `/api/v1/branches/` | Owner / Auth | List authorized branches or create a new branch (Owner/Platform Admin). |
| `PATCH` | `/api/v1/branches/{id}/` | Owner / Manager | Update branch settings, operating hours, tax rate, or buffer times. |
| `GET` | `/api/v1/dashboard/summary/` | Staff Roles | Real-time KPIs (today's appointments, upcoming, completed/cancelled, staff availability, daily sales, branch breakdown). |

### 2.2 Services, Staff & Scheduling
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET, POST` | `/api/v1/services/` | Auth / Manager | List or create salon services (with optional `?branch_id=` overrides). |
| `PATCH, DELETE` | `/api/v1/services/{id}/` | Owner / Manager | Update service duration, price, buffer, or active status. |
| `POST` | `/api/v1/branch-services/` | Owner / Manager | Configure branch-specific price/duration override for a service. |
| `GET, POST` | `/api/v1/staff/` | Auth / Manager | List or create staff profiles, branch assignments, and assigned services. |
| `PATCH` | `/api/v1/staff/{id}/` | Owner / Manager | Update staff profile, branch assignments, or skills. |
| `GET, POST` | `/api/v1/shifts/` | Auth / Manager | List or configure weekly staff shifts and breaks per branch. |

### 2.3 Public Customer Booking Portal
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/public/branches/` | Public | List active public branches with operating hours and contact info. |
| `GET` | `/api/v1/public/catalog/` | Public | List bookable services and qualified staff for `?branch_id=<uuid>`. |
| `GET` | `/api/v1/public/availability/` | Public | Calculate conflict-free time slots for `?branch_id=&service_ids=&date=&staff_id=`. |
| `POST` | `/api/v1/public/bookings/` | Public | Create a customer appointment with concurrency-safe overlap protection. |
| `GET` | `/api/v1/public/bookings/{reference}/` | Public | Retrieve booking status and details by booking reference + phone verification. |
| `POST` | `/api/v1/public/bookings/{reference}/reschedule/` | Public | Reschedule an appointment to a new valid date/time slot. |
| `POST` | `/api/v1/public/bookings/{reference}/cancel/` | Public | Cancel an appointment according to branch cancellation window policy. |

### 2.4 Internal Appointment Management
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET, POST` | `/api/v1/appointments/` | Authorized Staff | Filterable list/calendar of appointments (`?branch_id=&staff_id=&status=&date_from=&date_to=`) or create walk-in/admin booking. |
| `GET, PATCH` | `/api/v1/appointments/{id}/` | Authorized Staff | View appointment details or update notes. |
| `POST` | `/api/v1/appointments/{id}/status/` | Authorized Staff | Transition status (`CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`) and record `AppointmentStatusHistory`. |
| `POST` | `/api/v1/appointments/{id}/reschedule/` | Authorized Staff | Reschedule appointment with conflict verification. |

### 2.5 WhatsApp Business Integration
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET, POST` | `/api/v1/webhooks/whatsapp/` | Webhook / Verified | Meta WhatsApp webhook challenge verification (`GET`) and idempotent inbound message processor (`POST`). |
| `GET` | `/api/v1/integrations/messages/` | Owner / Manager | View inbound/outbound WhatsApp/SMS message logs and delivery statuses. |

### 2.6 Biometric Attendance & Payroll
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET, POST` | `/api/v1/attendance/devices/` | Owner / Manager | Register or list biometric attendance devices per branch. |
| `POST` | `/api/v1/attendance/events/ingest/` | Device Token / Manager | Ingest raw attendance punches with SHA-256 deduplication and auto-summary computation. |
| `GET` | `/api/v1/attendance/summaries/` | Authorized Staff | View daily attendance summaries, late minutes, and worked hours. |
| `POST` | `/api/v1/attendance/adjustments/` | Staff / Manager | Request or approve missing-punch attendance adjustments. |
| `GET, POST` | `/api/v1/payroll/runs/` | Owner / Accountant | List payroll runs or generate a draft payroll run computing base pay, attendance deductions, and service commissions. |
| `POST` | `/api/v1/payroll/runs/{id}/finalize/` | Owner / Accountant | Approve and finalize a payroll run (locks records from modification). |

### 2.7 Inventory, Billing & Finance
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET, POST` | `/api/v1/inventory/products/` | Authorized Staff | Manage products & consumables catalog and branch stock levels. |
| `POST` | `/api/v1/inventory/movements/` | Manager / Receptionist | Record stock purchases, consumption, adjustments, or transfers with ledger audit. |
| `GET, POST` | `/api/v1/billing/invoices/` | Receptionist / Manager / Accountant | List or issue invoices (from an appointment or POS walk-in). |
| `POST` | `/api/v1/billing/invoices/{id}/payments/` | Receptionist / Manager | Record single or split payments (`CASH`, `CARD`, `BANK_TRANSFER`, `WALLET`). |
| `POST` | `/api/v1/billing/invoices/{id}/refunds/` | Owner / Manager | Process a partial or full refund with audit reason. |
| `GET, POST` | `/api/v1/billing/expenses/` | Manager / Accountant | Record or list branch operational expenses. |
