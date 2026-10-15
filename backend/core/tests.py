from decimal import Decimal
from datetime import datetime, date, time, timedelta
from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status

from core.models import (
    Tenant, Branch, User, UserBranchRole, Service, BranchService,
    StaffProfile, StaffBranchAssignment, StaffService, OperatingHours,
    StaffShift, Customer, Appointment, AppointmentItem, Invoice, Payment,
    BiometricDevice, RawAttendanceEvent, AttendanceSummary, WhatsAppSession
)
from core.services import (
    AvailabilityService, BookingService, WhatsAppBookingService,
    BiometricAttendanceService, BillingService
)


class SalonSystemCoreTests(TestCase):
    def setUp(self):
        # 1. Tenant
        self.tenant = Tenant.objects.create(
            name="Test Luxe Aura",
            slug="test-luxe",
            default_currency="USD",
            default_tax_rate=Decimal("10.00"),
        )

        # 2. Branches
        self.branch1 = Branch.objects.create(
            tenant=self.tenant,
            name="Downtown Branch",
            code="DT-TEST",
            city="New York",
            tax_rate=Decimal("10.00"),
            cancellation_window_hours=24,
            buffer_minutes=15,
        )

        self.branch2 = Branch.objects.create(
            tenant=self.tenant,
            name="Uptown Branch",
            code="UP-TEST",
            city="Brooklyn",
            tax_rate=Decimal("10.00"),
            cancellation_window_hours=24,
            buffer_minutes=15,
        )

        # Operating hours for branch 1 (Mon-Sun 09:00 - 18:00)
        for d in range(7):
            OperatingHours.objects.create(
                branch=self.branch1,
                weekday=d,
                open_time=time(9, 0),
                close_time=time(18, 0),
            )

        # 3. Users & Roles
        self.owner = User.objects.create_user(
            email="owner@test.com",
            password="TestPassword123!",
            system_role=User.SystemRole.BUSINESS_OWNER,
            tenant=self.tenant,
            full_name="Owner User",
        )

        self.manager1 = User.objects.create_user(
            email="mgr1@test.com",
            password="TestPassword123!",
            system_role=User.SystemRole.STAFF,
            tenant=self.tenant,
            full_name="Downtown Manager",
        )
        UserBranchRole.objects.create(
            user=self.manager1,
            branch=self.branch1,
            role=UserBranchRole.Role.BRANCH_MANAGER,
        )

        self.manager2 = User.objects.create_user(
            email="mgr2@test.com",
            password="TestPassword123!",
            system_role=User.SystemRole.STAFF,
            tenant=self.tenant,
            full_name="Uptown Manager",
        )
        UserBranchRole.objects.create(
            user=self.manager2,
            branch=self.branch2,
            role=UserBranchRole.Role.BRANCH_MANAGER,
        )

        # 4. Services
        self.service1 = Service.objects.create(
            tenant=self.tenant,
            name="Haircut",
            category="Hair",
            default_duration_minutes=60,
            buffer_minutes=15,
            base_price=Decimal("50.00"),
        )
        self.service2 = Service.objects.create(
            tenant=self.tenant,
            name="Coloring",
            category="Color",
            default_duration_minutes=120,
            buffer_minutes=15,
            base_price=Decimal("150.00"),
        )

        # BranchService override: Haircut is $60 at Downtown branch
        BranchService.objects.create(
            branch=self.branch1,
            service=self.service1,
            price=Decimal("60.00"),
            duration_minutes=60,
        )

        # 5. Staff
        self.staff1 = StaffProfile.objects.create(
            tenant=self.tenant,
            employee_code="STF-01",
            full_name="Alice Stylist",
            biometric_user_id="BIO-001",
        )
        StaffBranchAssignment.objects.create(staff=self.staff1, branch=self.branch1, is_primary=True)
        StaffService.objects.create(staff=self.staff1, service=self.service1)
        StaffService.objects.create(staff=self.staff1, service=self.service2)

        # Weekly shifts for Alice (Mon-Sun 09:00 - 17:00, lunch break 13:00 - 14:00)
        for d in range(7):
            StaffShift.objects.create(
                branch=self.branch1,
                staff=self.staff1,
                weekday=d,
                start_time=time(9, 0),
                end_time=time(17, 0),
                break_start=time(13, 0),
                break_end=time(14, 0),
            )

        self.client = APIClient()

    # ----------------------------------------------------
    # 1. Authentication & JWT Tests
    # ----------------------------------------------------
    def test_auth_login_success(self):
        resp = self.client.post("/api/v1/auth/login/", {
            "email": "owner@test.com",
            "password": "TestPassword123!",
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertEqual(resp.data["user"]["system_role"], "BUSINESS_OWNER")

    def test_auth_login_invalid(self):
        resp = self.client.post("/api/v1/auth/login/", {
            "email": "owner@test.com",
            "password": "WrongPassword",
        })
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    # ----------------------------------------------------
    # 2. Multi-Branch Isolation & Permissions
    # ----------------------------------------------------
    def test_branch_manager_isolation(self):
        # Authenticate as Manager of Downtown Branch (branch1)
        login_resp = self.client.post("/api/v1/auth/login/", {
            "email": "mgr1@test.com",
            "password": "TestPassword123!",
        })
        token = login_resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # Downtown manager listing branches should only see branch1
        resp = self.client.get("/api/v1/branches/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        branch_ids = [b["id"] for b in resp.data.get("results", resp.data)]
        self.assertIn(str(self.branch1.id), branch_ids)
        self.assertNotIn(str(self.branch2.id), branch_ids)

    # ----------------------------------------------------
    # 3. Branch-Specific Pricing
    # ----------------------------------------------------
    def test_branch_service_pricing_override(self):
        resp = self.client.get(f"/api/v1/public/catalog/?branch_id={self.branch1.id}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        services = resp.data["services"]
        haircut = next(s for s in services if s["id"] == str(self.service1.id))
        # Override price is 60.00
        self.assertEqual(haircut["price"], "60.00")

    # ----------------------------------------------------
    # 4. Slot Availability Calculation
    # ----------------------------------------------------
    def test_availability_calculation(self):
        test_date = (timezone.localdate() + timedelta(days=2)).isoformat()
        slots = AvailabilityService.get_available_slots(
            branch_id=self.branch1.id,
            service_ids=[self.service1.id],
            target_date=test_date,
        )
        self.assertTrue(len(slots) > 0)
        times = [s["time"] for s in slots]
        # Should include 09:00
        self.assertIn("09:00", times)
        # Should exclude lunch break 13:00 - 14:00 (duration is 60m)
        self.assertNotIn("13:00", times)
        self.assertNotIn("13:15", times)

    # ----------------------------------------------------
    # 5. Concurrency-Safe Booking & Overlap Prevention
    # ----------------------------------------------------
    def test_booking_creation_and_overlap_prevention(self):
        test_date = timezone.localdate() + timedelta(days=3)
        start_time = timezone.make_aware(datetime.combine(test_date, time(10, 0)))

        # 1. Book first appointment 10:00 - 11:00
        appt1 = BookingService.book_appointment(
            branch_id=self.branch1.id,
            service_ids=[self.service1.id],
            start_time_iso=start_time.isoformat(),
            customer_data={"full_name": "Test Client 1", "phone": "+19998887771"},
            preferred_staff_id=self.staff1.id,
        )
        self.assertEqual(appt1.status, Appointment.Status.CONFIRMED)
        self.assertEqual(appt1.subtotal_amount, Decimal("60.00"))

        # 2. Attempt to book an overlapping appointment at 10:30 for the same staff
        overlap_time = timezone.make_aware(datetime.combine(test_date, time(10, 30)))
        with self.assertRaises(ValidationError):
            BookingService.book_appointment(
                branch_id=self.branch1.id,
                service_ids=[self.service1.id],
                start_time_iso=overlap_time.isoformat(),
                customer_data={"full_name": "Test Client 2", "phone": "+19998887772"},
                preferred_staff_id=self.staff1.id,
            )

    # ----------------------------------------------------
    # 6. Cancellation Policy Enforcement
    # ----------------------------------------------------
    def test_cancellation_policy(self):
        future_date = timezone.now() + timedelta(days=5)
        appt = BookingService.book_appointment(
            branch_id=self.branch1.id,
            service_ids=[self.service1.id],
            start_time_iso=future_date.isoformat(),
            customer_data={"full_name": "Cancel Test", "phone": "+19998887773"},
            preferred_staff_id=self.staff1.id,
        )

        cancelled = BookingService.cancel_appointment(
            appointment_id=appt.id,
            reason="Change of plans",
            is_customer_initiated=True,
        )
        self.assertEqual(cancelled.status, Appointment.Status.CANCELLED)

    # ----------------------------------------------------
    # 7. WhatsApp Conversational Booking Flow
    # ----------------------------------------------------
    def test_whatsapp_booking_flow(self):
        phone = "+15550001122"

        # Step 1: Greeting
        reply1 = WhatsAppBookingService.process_incoming_message(self.tenant, phone, "hi")
        self.assertIn("Welcome to", reply1)

        # Step 2: Select Branch (1 for Downtown)
        reply2 = WhatsAppBookingService.process_incoming_message(self.tenant, phone, "1")
        self.assertIn("service", reply2.lower())

        # Step 3: Select Service (1 for Haircut)
        reply3 = WhatsAppBookingService.process_incoming_message(self.tenant, phone, "1")
        self.assertIn("date", reply3.lower())

        # Step 4: Select Date (1)
        reply4 = WhatsAppBookingService.process_incoming_message(self.tenant, phone, "1")
        self.assertIn("Available times", reply4)

        # Step 5: Select Slot (1)
        reply5 = WhatsAppBookingService.process_incoming_message(self.tenant, phone, "1")
        self.assertIn("Please reply with your *Full Name*", reply5)

        # Step 6: Confirm with Name
        reply6 = WhatsAppBookingService.process_incoming_message(self.tenant, phone, "Jessica Alba")
        self.assertIn("Booking Confirmed", reply6)
        self.assertIn("Jessica Alba", reply6)

        # Verify appointment exists in database
        self.assertTrue(Appointment.objects.filter(customer__phone=phone).exists())

    # ----------------------------------------------------
    # 8. Biometric Attendance Ingestion & Deduplication
    # ----------------------------------------------------
    def test_biometric_ingest_and_deduplication(self):
        device = BiometricDevice.objects.create(
            tenant=self.tenant,
            branch=self.branch1,
            name="Front Gate",
            serial_number="BIO-TEST-001",
        )

        punch_time = (timezone.now() - timedelta(hours=2)).isoformat()
        punches = [
            {"biometric_user_id": "BIO-001", "timestamp": punch_time, "event_type": "CHECK_IN"},
            # Duplicate punch identical to above
            {"biometric_user_id": "BIO-001", "timestamp": punch_time, "event_type": "CHECK_IN"},
        ]

        result = BiometricAttendanceService.ingest_punch_batch(
            branch=self.branch1,
            punches=punches,
            device=device,
        )
        self.assertEqual(result["imported"], 1)
        self.assertEqual(result["duplicated"], 1)

        # Verify summary was created
        summary = AttendanceSummary.objects.filter(staff=self.staff1).first()
        self.assertIsNotNone(summary)

    # ----------------------------------------------------
    # 9. Invoicing & Payment
    # ----------------------------------------------------
    def test_invoicing_and_split_payment(self):
        future_time = timezone.now() + timedelta(days=4)
        appt = BookingService.book_appointment(
            branch_id=self.branch1.id,
            service_ids=[self.service1.id],
            start_time_iso=future_time.isoformat(),
            customer_data={"full_name": "Billing Test", "phone": "+19998887779"},
            preferred_staff_id=self.staff1.id,
        )

        invoice = BillingService.create_invoice_for_appointment(appt, self.manager1)
        self.assertEqual(invoice.status, Invoice.Status.ISSUED)
        self.assertEqual(invoice.total_amount, appt.total_amount)

        # Payment 1 (Split: Cash $30)
        p1 = BillingService.record_payment(invoice.id, Payment.Method.CASH, Decimal("30.00"), self.manager1)
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, Invoice.Status.PARTIALLY_PAID)

        # Payment 2 (Remainder via Card)
        rem = invoice.total_amount - Decimal("30.00")
        p2 = BillingService.record_payment(invoice.id, Payment.Method.CARD, rem, self.manager1)
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, Invoice.Status.PAID)
        self.assertEqual(invoice.amount_paid, invoice.total_amount)
