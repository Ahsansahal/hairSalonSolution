# Security & Compliance Architecture

## 1. Authentication & Password Security

- **Password Hashing**: Django's PBKDF2/Argon2 password hashers with strong password validation rules.
- **Stateless JWT Authentication**: Short-lived access tokens and rotatable refresh tokens via `djangorestframework-simplejwt`.
- **Zero Hardcoded Secrets**: All secret keys, database URLs, and third-party API credentials are loaded strictly from environment variables (`.env`), with placeholder templates documented in `.env.example`.

## 2. Multi-Tenant & Multi-Branch Authorization (Least Privilege)

Every protected endpoint enforces two layers of access control:
1. **Role Permission Check**: Verifies the user's role (`PLATFORM_ADMIN`, `BUSINESS_OWNER`, `BRANCH_MANAGER`, `RECEPTIONIST`, `STAFF_MEMBER`, `ACCOUNTANT`, `CUSTOMER`) against the allowed actions on the resource.
2. **Tenant & Branch Scope Enforcement**:
   - Querysets are filtered by `tenant_id = request.user.tenant_id`.
   - For branch-scoped roles (`BRANCH_MANAGER`, `RECEPTIONIST`, `STAFF_MEMBER`), requests targeting a `branch_id` not present in the user's active `UserBranchRole` assignments are rejected with `403 Forbidden`.
   - `STAFF_MEMBER` role is further restricted to reading their own schedules, assigned appointments, and personal attendance records.

## 3. Financial & Attendance Audit Integrity

- **No Silent Deletion**: Posted invoices, recorded payments, refunds, finalized payroll runs, and raw biometric attendance events cannot be deleted via API. Corrections must occur via explicit auditable reversal records (`Refund`, `AttendanceAdjustment`, `VOID` status transition).
- **Immutable Audit Trail**: Critical state mutations (appointment status transitions, role assignments, invoice issuance, refunds, payroll finalization) write structured records to `AuditLog` and `AppointmentStatusHistory`.

## 4. Webhook & External Integration Security

- **WhatsApp Webhook Verification**:
  - Supports Meta hub challenge token verification (`hub.verify_token`) and HMAC-SHA256 payload signature validation (`X-Hub-Signature-256`) when `WHATSAPP_APP_SECRET` is configured.
  - Enforces idempotency via unique `WebhookEvent.event_id` constraints so retried webhook deliveries never create duplicate appointments or messages.
- **Biometric Privacy**:
  - The system stores **only** pseudonymous `biometric_user_id` badge/device identifiers and punch timestamps. Raw fingerprint minutiae or facial recognition templates are never transmitted to or stored in the central cloud database.
- **Customer Consent Tracking**:
  - `Customer` records explicitly track `whatsapp_opt_in`, `sms_opt_in`, `email_opt_in`, and `consent_updated_at` timestamps.
