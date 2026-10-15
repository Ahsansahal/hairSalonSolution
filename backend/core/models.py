import uuid
import hashlib
from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_("The Email field must be set"))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("system_role", User.SystemRole.PLATFORM_ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self.create_user(email, password, **extra_fields)


# ==========================================
# 1. Organization & Multi-Tenant Access
# ==========================================

class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    legal_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    default_currency = models.CharField(max_length=10, default="USD")
    default_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Branch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="branches")
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    timezone = models.CharField(max_length=50, default="UTC")
    currency = models.CharField(max_length=10, default="USD")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))
    cancellation_window_hours = models.IntegerField(default=24)
    buffer_minutes = models.IntegerField(default=15)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "branches"
        unique_together = ("tenant", "code")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"


class User(AbstractUser):
    class SystemRole(models.TextChoices):
        PLATFORM_ADMIN = "PLATFORM_ADMIN", _("Platform Administrator")
        BUSINESS_OWNER = "BUSINESS_OWNER", _("Business Owner")
        STAFF = "STAFF", _("Staff Member")
        CUSTOMER = "CUSTOMER", _("Customer")

    username = None
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True, related_name="users")
    email = models.EmailField(_("email address"), unique=True)
    full_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    system_role = models.CharField(
        max_length=30,
        choices=SystemRole.choices,
        default=SystemRole.STAFF,
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.system_role})"

    @property
    def display_name(self):
        return self.full_name or self.email


class UserBranchRole(models.Model):
    class Role(models.TextChoices):
        BRANCH_MANAGER = "BRANCH_MANAGER", _("Branch Manager")
        RECEPTIONIST = "RECEPTIONIST", _("Receptionist")
        STAFF_MEMBER = "STAFF_MEMBER", _("Staff Member")
        ACCOUNTANT = "ACCOUNTANT", _("Accountant")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="branch_roles")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="user_roles")
    role = models.CharField(max_length=30, choices=Role.choices)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "branch", "role")

    def __str__(self):
        return f"{self.user.email} -> {self.branch.name} ({self.role})"


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="audit_logs")
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs")
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="actions_performed")
    entity_type = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=100)
    action = models.CharField(max_length=50)  # CREATE, UPDATE, DELETE, STATUS_CHANGE
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


# ==========================================
# 2. Staff, Services & Scheduling
# ==========================================

class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="services")
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default="General")
    description = models.TextField(blank=True)
    default_duration_minutes = models.PositiveIntegerField(default=60)
    buffer_minutes = models.PositiveIntegerField(default=10)
    base_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    is_active = models.BooleanField(default=True)
    public_bookable = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "name"]

    def __str__(self):
        return f"{self.name} (${self.base_price})"


class BranchService(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="branch_services")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="branch_overrides")
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    buffer_minutes = models.PositiveIntegerField(null=True, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ("branch", "service")

    def __str__(self):
        return f"{self.service.name} @ {self.branch.name}"

    def effective_price(self):
        return self.price if self.price is not None else self.service.base_price

    def effective_duration(self):
        return self.duration_minutes if self.duration_minutes is not None else self.service.default_duration_minutes

    def effective_buffer(self):
        return self.buffer_minutes if self.buffer_minutes is not None else self.service.buffer_minutes


class StaffProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="staff_profiles")
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="staff_profile")
    employee_code = models.CharField(max_length=50)
    full_name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    title = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    biometric_user_id = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    joined_date = models.DateField(default=timezone.now)

    class Meta:
        unique_together = ("tenant", "employee_code")
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.employee_code})"


class StaffBranchAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name="branch_assignments")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="assigned_staff")
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("staff", "branch")

    def __str__(self):
        return f"{self.staff.full_name} at {self.branch.name}"


class StaffService(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name="qualified_services")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="qualified_staff")
    custom_duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("staff", "service")

    def __str__(self):
        return f"{self.staff.full_name} -> {self.service.name}"


class OperatingHours(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="operating_hours")
    weekday = models.IntegerField(choices=[
        (0, "Monday"), (1, "Tuesday"), (2, "Wednesday"), (3, "Thursday"),
        (4, "Friday"), (5, "Saturday"), (6, "Sunday")
    ])
    open_time = models.TimeField()
    close_time = models.TimeField()
    is_closed = models.BooleanField(default=False)

    class Meta:
        unique_together = ("branch", "weekday")
        ordering = ["weekday"]

    def __str__(self):
        return f"{self.branch.name}: Day {self.weekday} ({self.open_time} - {self.close_time})"


class StaffShift(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="staff_shifts")
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name="shifts")
    weekday = models.IntegerField(choices=[
        (0, "Monday"), (1, "Tuesday"), (2, "Wednesday"), (3, "Thursday"),
        (4, "Friday"), (5, "Saturday"), (6, "Sunday")
    ])
    start_time = models.TimeField()
    end_time = models.TimeField()
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["weekday", "start_time"]

    def __str__(self):
        return f"{self.staff.full_name} @ {self.branch.name} (Day {self.weekday}: {self.start_time}-{self.end_time})"


class StaffTimeOff(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        APPROVED = "APPROVED", _("Approved")
        REJECTED = "REJECTED", _("Rejected")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name="time_offs")
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    reason = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    def __str__(self):
        return f"{self.staff.full_name} TimeOff ({self.start_datetime.date()} to {self.end_datetime.date()})"


# ==========================================
# 3. Customers & Appointments
# ==========================================

class Customer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="customers")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="customer_profile")
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    whatsapp_opt_in = models.BooleanField(default=True)
    sms_opt_in = models.BooleanField(default=False)
    email_opt_in = models.BooleanField(default=True)
    consent_updated_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("tenant", "phone")
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.phone})"


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        CONFIRMED = "CONFIRMED", _("Confirmed")
        CHECKED_IN = "CHECKED_IN", _("Checked In")
        IN_PROGRESS = "IN_PROGRESS", _("In Progress")
        COMPLETED = "COMPLETED", _("Completed")
        CANCELLED = "CANCELLED", _("Cancelled")
        NO_SHOW = "NO_SHOW", _("No Show")

    class Source(models.TextChoices):
        WEBSITE = "WEBSITE", _("Website")
        WHATSAPP = "WHATSAPP", _("WhatsApp")
        WALK_IN = "WALK_IN", _("Walk In")
        ADMIN = "ADMIN", _("Admin")
        PHONE = "PHONE", _("Phone")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="appointments")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="appointments")
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="appointments")
    primary_staff = models.ForeignKey(StaffProfile, on_delete=models.PROTECT, related_name="primary_appointments")
    booking_reference = models.CharField(max_length=30, unique=True)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.WEBSITE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    buffer_minutes = models.PositiveIntegerField(default=15)
    total_duration_minutes = models.PositiveIntegerField(default=60)
    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_appointments")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_time"]
        indexes = [
            models.Index(fields=["branch", "start_time"]),
            models.Index(fields=["primary_staff", "start_time"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.booking_reference} - {self.customer.full_name} ({self.status})"

    @property
    def end_time_with_buffer(self):
        return self.end_time + timezone.timedelta(minutes=self.buffer_minutes)


class AppointmentItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name="items")
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name="appointment_items")
    staff = models.ForeignKey(StaffProfile, on_delete=models.PROTECT, related_name="performed_items")
    service_name_snapshot = models.CharField(max_length=200)
    duration_minutes = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    sequence_order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["sequence_order"]

    def __str__(self):
        return f"{self.service_name_snapshot} for {self.appointment.booking_reference}"


class AppointmentStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name="status_history")
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class BookingHold(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    session_key = models.CharField(max_length=100)
    expires_at = models.DateTimeField()
    is_released = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["staff", "expires_at", "is_released"]),
        ]


# ==========================================
# 4. Biometric Attendance & Payroll
# ==========================================

class BiometricDevice(models.Model):
    class Status(models.TextChoices):
        ONLINE = "ONLINE", _("Online")
        OFFLINE = "OFFLINE", _("Offline")
        ERROR = "ERROR", _("Error")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="biometric_devices")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="biometric_devices")
    name = models.CharField(max_length=150)
    serial_number = models.CharField(max_length=100, unique=True)
    device_model = models.CharField(max_length=100, blank=True)
    api_token = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    last_sync_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OFFLINE)

    def __str__(self):
        return f"{self.name} ({self.branch.name}) - {self.serial_number}"


class DeviceSyncRun(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(BiometricDevice, on_delete=models.CASCADE, related_name="sync_runs")
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    events_received = models.IntegerField(default=0)
    events_imported = models.IntegerField(default=0)
    events_duplicated = models.IntegerField(default=0)
    status = models.CharField(max_length=30, default="COMPLETED")
    error_message = models.TextField(blank=True)


class RawAttendanceEvent(models.Model):
    class EventType(models.TextChoices):
        CHECK_IN = "CHECK_IN", _("Check In")
        CHECK_OUT = "CHECK_OUT", _("Check Out")
        BREAK_OUT = "BREAK_OUT", _("Break Out")
        BREAK_IN = "BREAK_IN", _("Break In")
        UNKNOWN = "UNKNOWN", _("Unknown")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="raw_attendance_events")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="raw_attendance_events")
    device = models.ForeignKey(BiometricDevice, on_delete=models.SET_NULL, null=True, blank=True)
    staff = models.ForeignKey(StaffProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="attendance_events")
    biometric_user_id = models.CharField(max_length=100)
    event_type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.CHECK_IN)
    timestamp = models.DateTimeField()
    external_event_id = models.CharField(max_length=150, blank=True)
    dedup_hash = models.CharField(max_length=64, unique=True)
    raw_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    @staticmethod
    def generate_dedup_hash(device_id, biometric_user_id, timestamp_str):
        raw = f"{device_id}_{biometric_user_id}_{timestamp_str}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class AttendanceSummary(models.Model):
    class Status(models.TextChoices):
        PRESENT = "PRESENT", _("Present")
        ABSENT = "ABSENT", _("Absent")
        LATE = "LATE", _("Late")
        LEAVE = "LEAVE", _("Leave")
        INCOMPLETE = "INCOMPLETE", _("Incomplete")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="attendance_summaries")
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name="attendance_summaries")
    work_date = models.DateField()
    first_check_in = models.DateTimeField(null=True, blank=True)
    last_check_out = models.DateTimeField(null=True, blank=True)
    worked_minutes = models.IntegerField(default=0)
    late_minutes = models.IntegerField(default=0)
    overtime_minutes = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)

    class Meta:
        unique_together = ("branch", "staff", "work_date")
        ordering = ["-work_date"]

    def __str__(self):
        return f"{self.staff.full_name} on {self.work_date}: {self.status} ({self.worked_minutes}m)"


class AttendanceAdjustment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        APPROVED = "APPROVED", _("Approved")
        REJECTED = "REJECTED", _("Rejected")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    summary = models.ForeignKey(AttendanceSummary, on_delete=models.CASCADE, related_name="adjustments")
    requested_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="requested_adjustments")
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_adjustments")
    adjusted_check_in = models.DateTimeField(null=True, blank=True)
    adjusted_check_out = models.DateTimeField(null=True, blank=True)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)


class SalaryRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff = models.OneToOneField(StaffProfile, on_delete=models.CASCADE, related_name="salary_rule")
    base_monthly_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    hourly_rate = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    overtime_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("1.50"))
    late_deduction_per_minute = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("0.50"))

    def __str__(self):
        return f"Salary Rule: {self.staff.full_name}"


class CommissionRule(models.Model):
    class Type(models.TextChoices):
        PERCENTAGE = "PERCENTAGE", _("Percentage")
        FIXED = "FIXED", _("Fixed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="commission_rules")
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, null=True, blank=True, related_name="commission_rules")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, null=True, blank=True, related_name="commission_rules")
    commission_type = models.CharField(max_length=20, choices=Type.choices, default=Type.PERCENTAGE)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("10.00"))
    is_active = models.BooleanField(default=True)

    def __str__(self):
        staff_name = self.staff.full_name if self.staff else "All Staff"
        service_name = self.service.name if self.service else "All Services"
        return f"{staff_name} on {service_name}: {self.value} ({self.commission_type})"


class PayrollRun(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", _("Draft")
        APPROVED = "APPROVED", _("Approved")
        FINALIZED = "FINALIZED", _("Finalized")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="payroll_runs")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="payroll_runs")
    period_start = models.DateField()
    period_end = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    total_gross = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_commissions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_net = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    processed_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="processed_payrolls")
    finalized_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-period_end"]


class PayrollItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name="items")
    staff = models.ForeignKey(StaffProfile, on_delete=models.PROTECT, related_name="payroll_items")
    base_pay = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    commission_pay = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    overtime_pay = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    bonuses = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    net_pay = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    days_worked = models.IntegerField(default=0)
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal("0.00"))
    late_deduction_hours = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal("0.00"))
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    payment_status = models.CharField(max_length=20, default="PENDING")  # PAID, PENDING, PARTIAL
    notes = models.TextField(blank=True)


# ==========================================
# 5. Inventory & Finance
# ==========================================

class Product(models.Model):
    class Category(models.TextChoices):
        RETAIL = "RETAIL", _("Retail Product")
        CONSUMABLE = "CONSUMABLE", _("Salon Consumable")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="products")
    sku = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.RETAIL)
    unit = models.CharField(max_length=50, default="piece")
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    reorder_level = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("5.00"))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("tenant", "sku")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.sku})"


class BranchInventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="inventory_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="branch_stocks")
    quantity_on_hand = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    reorder_level_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("branch", "product")

    def __str__(self):
        return f"{self.product.name} @ {self.branch.name}: {self.quantity_on_hand} {self.product.unit}"


class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        PURCHASE = "PURCHASE", _("Purchase / Restock")
        SALE = "SALE", _("Retail Sale")
        CONSUMPTION = "CONSUMPTION", _("Service Consumption")
        ADJUSTMENT = "ADJUSTMENT", _("Manual Audit Adjustment")
        TRANSFER_IN = "TRANSFER_IN", _("Transfer In")
        TRANSFER_OUT = "TRANSFER_OUT", _("Transfer Out")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch_inventory = models.ForeignKey(BranchInventory, on_delete=models.CASCADE, related_name="movements")
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity_delta = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    reference_id = models.CharField(max_length=150, blank=True)
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="stock_actions")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Supplier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="suppliers")
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", _("Draft")
        ORDERED = "ORDERED", _("Ordered")
        RECEIVED = "RECEIVED", _("Received")
        CANCELLED = "CANCELLED", _("Cancelled")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="purchase_orders")
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name="purchase_orders")
    po_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    created_at = models.DateTimeField(auto_now_add=True)


class Invoice(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", _("Draft")
        ISSUED = "ISSUED", _("Issued")
        PARTIALLY_PAID = "PARTIALLY_PAID", _("Partially Paid")
        PAID = "PAID", _("Paid")
        REFUNDED = "REFUNDED", _("Refunded")
        VOID = "VOID", _("Void")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="invoices")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="invoices")
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    appointment = models.OneToOneField(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoice")
    invoice_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ISSUED)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    issued_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="issued_invoices")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.invoice_number} (${self.total_amount})"

    @property
    def balance_due(self):
        return max(Decimal("0.00"), self.total_amount - self.amount_paid)


class InvoiceItem(models.Model):
    class ItemType(models.TextChoices):
        SERVICE = "SERVICE", _("Service")
        PRODUCT = "PRODUCT", _("Product")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    item_type = models.CharField(max_length=20, choices=ItemType.choices, default=ItemType.SERVICE)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    staff = models.ForeignKey(StaffProfile, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("1.00"))
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.description} (${self.total_price})"


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = "CASH", _("Cash")
        CARD = "CARD", _("Card / POS")
        BANK_TRANSFER = "BANK_TRANSFER", _("Bank Transfer")
        WALLET = "WALLET", _("Digital Wallet")
        ONLINE = "ONLINE", _("Online Payment")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name="payments")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="payments")
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.CASH)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference_code = models.CharField(max_length=150, blank=True)
    received_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="received_payments")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.method} - ${self.amount} for {self.invoice.invoice_number}"


class Refund(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(Payment, on_delete=models.PROTECT, related_name="refunds")
    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name="refunds")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField()
    approved_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="approved_refunds")
    created_at = models.DateTimeField(auto_now_add=True)


class Expense(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="expenses")
    category = models.CharField(max_length=100)
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    incurred_date = models.DateField(default=timezone.now)
    recorded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="recorded_expenses")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-incurred_date"]


class CashRegisterSession(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", _("Open")
        CLOSED = "CLOSED", _("Closed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="cash_sessions")
    opened_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="opened_cash_sessions")
    closed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="closed_cash_sessions")
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    closing_balance_counted = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expected_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-opened_at"]


# ==========================================
# 6. Messaging & Integrations
# ==========================================

class NotificationTemplate(models.Model):
    class Channel(models.TextChoices):
        WHATSAPP = "WHATSAPP", _("WhatsApp")
        SMS = "SMS", _("SMS")
        EMAIL = "EMAIL", _("Email")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="notification_templates")
    code = models.CharField(max_length=100)
    channel = models.CharField(max_length=20, choices=Channel.choices)
    body_template = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("tenant", "code", "channel")


class MessageLog(models.Model):
    class Direction(models.TextChoices):
        INBOUND = "INBOUND", _("Inbound")
        OUTBOUND = "OUTBOUND", _("Outbound")

    class Status(models.TextChoices):
        QUEUED = "QUEUED", _("Queued")
        SENT = "SENT", _("Sent")
        DELIVERED = "DELIVERED", _("Delivered")
        FAILED = "FAILED", _("Failed")
        RECEIVED = "RECEIVED", _("Received")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="message_logs")
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    channel = models.CharField(max_length=20, default="WHATSAPP")
    direction = models.CharField(max_length=20, choices=Direction.choices, default=Direction.OUTBOUND)
    recipient_phone = models.CharField(max_length=50)
    content = models.TextField()
    provider_message_id = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SENT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class WebhookEvent(models.Model):
    class Provider(models.TextChoices):
        WHATSAPP = "WHATSAPP", _("WhatsApp")
        PAYMENT = "PAYMENT", _("Payment Gateway")
        BIOMETRIC = "BIOMETRIC", _("Biometric Device")

    class Status(models.TextChoices):
        PROCESSED = "PROCESSED", _("Processed")
        IGNORED = "IGNORED", _("Ignored")
        FAILED = "FAILED", _("Failed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.CharField(max_length=30, choices=Provider.choices)
    event_id = models.CharField(max_length=150, unique=True)
    payload = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PROCESSED)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class WhatsAppSession(models.Model):
    class State(models.TextChoices):
        GREETING = "GREETING", _("Greeting")
        SELECT_BRANCH = "SELECT_BRANCH", _("Select Branch")
        SELECT_SERVICE = "SELECT_SERVICE", _("Select Service")
        SELECT_STAFF = "SELECT_STAFF", _("Select Staff")
        SELECT_DATE = "SELECT_DATE", _("Select Date")
        SELECT_SLOT = "SELECT_SLOT", _("Select Slot")
        CONFIRM = "CONFIRM", _("Confirm Details")
        COMPLETED = "COMPLETED", _("Completed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="whatsapp_sessions")
    phone_number = models.CharField(max_length=50)
    state = models.CharField(max_length=30, choices=State.choices, default=State.GREETING)
    context_data = models.JSONField(default=dict, blank=True)
    last_interaction_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("tenant", "phone_number")
