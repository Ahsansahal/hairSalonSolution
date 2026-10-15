from rest_framework import serializers
from decimal import Decimal
from django.contrib.auth import get_user_model
from .models import (
    Tenant, Branch, UserBranchRole, Service, BranchService, StaffProfile,
    StaffBranchAssignment, StaffService, OperatingHours, StaffShift, StaffTimeOff,
    Customer, Appointment, AppointmentItem, AppointmentStatusHistory,
    BiometricDevice, DeviceSyncRun, RawAttendanceEvent, AttendanceSummary,
    AttendanceAdjustment, SalaryRule, CommissionRule, PayrollRun, PayrollItem,
    Product, BranchInventory, StockMovement, Supplier, PurchaseOrder,
    Invoice, InvoiceItem, Payment, Refund, Expense, CashRegisterSession,
    MessageLog, WebhookEvent, WhatsAppSession, AuditLog
)

User = get_user_model()


class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = "__all__"


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = "__all__"


class UserBranchRoleSerializer(serializers.ModelSerializer):
    branch_name = serializers.ReadOnlyField(source="branch.name")
    user_email = serializers.ReadOnlyField(source="user.email")

    class Meta:
        model = UserBranchRole
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    branch_roles = UserBranchRoleSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "phone", "system_role", "is_active", "tenant", "branch_roles"]


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class BranchServiceSerializer(serializers.ModelSerializer):
    service_name = serializers.ReadOnlyField(source="service.name")
    service_category = serializers.ReadOnlyField(source="service.category")
    effective_price = serializers.ReadOnlyField()
    effective_duration = serializers.ReadOnlyField()

    class Meta:
        model = BranchService
        fields = "__all__"


class StaffBranchAssignmentSerializer(serializers.ModelSerializer):
    branch_name = serializers.ReadOnlyField(source="branch.name")

    class Meta:
        model = StaffBranchAssignment
        fields = "__all__"


class StaffServiceSerializer(serializers.ModelSerializer):
    service_name = serializers.ReadOnlyField(source="service.name")

    class Meta:
        model = StaffService
        fields = "__all__"


class StaffShiftSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source="staff.full_name")
    branch_name = serializers.ReadOnlyField(source="branch.name")

    class Meta:
        model = StaffShift
        fields = "__all__"


class StaffProfileSerializer(serializers.ModelSerializer):
    branch_assignments = StaffBranchAssignmentSerializer(many=True, read_only=True)
    qualified_services = StaffServiceSerializer(many=True, read_only=True)
    shifts = StaffShiftSerializer(many=True, read_only=True)

    class Meta:
        model = StaffProfile
        fields = "__all__"


class OperatingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatingHours
        fields = "__all__"


class StaffTimeOffSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source="staff.full_name")

    class Meta:
        model = StaffTimeOff
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class AppointmentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentItem
        fields = "__all__"


class AppointmentStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.ReadOnlyField(source="changed_by.full_name")

    class Meta:
        model = AppointmentStatusHistory
        fields = "__all__"


class AppointmentSerializer(serializers.ModelSerializer):
    items = AppointmentItemSerializer(many=True, read_only=True)
    customer_name = serializers.ReadOnlyField(source="customer.full_name")
    customer_phone = serializers.ReadOnlyField(source="customer.phone")
    branch_name = serializers.ReadOnlyField(source="branch.name")
    staff_name = serializers.ReadOnlyField(source="primary_staff.full_name")
    status_history = AppointmentStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Appointment
        fields = "__all__"


# Public Booking Serializers
class PublicBranchSerializer(serializers.ModelSerializer):
    operating_hours = OperatingHoursSerializer(many=True, read_only=True)

    class Meta:
        model = Branch
        fields = [
            "id", "name", "code", "address", "city", "phone", "email",
            "timezone", "currency", "operating_hours"
        ]


class PublicServiceSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ["id", "name", "category", "description", "price", "duration_minutes"]

    def get_price(self, obj):
        branch = self.context.get("branch")
        if branch:
            b_override = BranchService.objects.filter(branch=branch, service=obj).first()
            if b_override and b_override.price is not None:
                return str(b_override.price)
        return str(obj.base_price)

    def get_duration_minutes(self, obj):
        branch = self.context.get("branch")
        if branch:
            b_override = BranchService.objects.filter(branch=branch, service=obj).first()
            if b_override and b_override.duration_minutes is not None:
                return b_override.duration_minutes
        return obj.default_duration_minutes


class PublicStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = ["id", "full_name", "title", "bio"]


class PublicBookingCreateSerializer(serializers.Serializer):
    branch_id = serializers.UUIDField()
    service_ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)
    start_time = serializers.DateTimeField()
    preferred_staff_id = serializers.UUIDField(required=False, allow_null=True)
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=50)
    email = serializers.EmailField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    whatsapp_opt_in = serializers.BooleanField(default=True)


# Biometric Serializers
class BiometricDeviceSerializer(serializers.ModelSerializer):
    branch_name = serializers.ReadOnlyField(source="branch.name")

    class Meta:
        model = BiometricDevice
        fields = "__all__"


class RawAttendanceEventSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source="staff.full_name")

    class Meta:
        model = RawAttendanceEvent
        fields = "__all__"


class AttendanceSummarySerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source="staff.full_name")
    employee_code = serializers.ReadOnlyField(source="staff.employee_code")

    class Meta:
        model = AttendanceSummary
        fields = "__all__"


class AttendanceAdjustmentSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source="summary.staff.full_name")
    requested_by_name = serializers.ReadOnlyField(source="requested_by.full_name")

    class Meta:
        model = AttendanceAdjustment
        fields = "__all__"


# Payroll Serializers
class SalaryRuleSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source="staff.full_name")

    class Meta:
        model = SalaryRule
        fields = "__all__"


class CommissionRuleSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source="staff.full_name")
    service_name = serializers.ReadOnlyField(source="service.name")

    class Meta:
        model = CommissionRule
        fields = "__all__"


class PayrollItemSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source="staff.full_name")
    employee_code = serializers.ReadOnlyField(source="staff.employee_code")
    staff_title = serializers.ReadOnlyField(source="staff.title")
    remaining_balance = serializers.SerializerMethodField()

    class Meta:
        model = PayrollItem
        fields = "__all__"

    def get_remaining_balance(self, obj):
        return f"{max(Decimal('0.00'), obj.net_pay - obj.amount_paid):.2f}"


class PayrollRunSerializer(serializers.ModelSerializer):
    items = PayrollItemSerializer(many=True, read_only=True)
    branch_name = serializers.ReadOnlyField(source="branch.name")

    class Meta:
        model = PayrollRun
        fields = "__all__"


# Inventory Serializers
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class BranchInventorySerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")
    product_sku = serializers.ReadOnlyField(source="product.sku")
    product_category = serializers.ReadOnlyField(source="product.category")
    product_unit = serializers.ReadOnlyField(source="product.unit")
    selling_price = serializers.ReadOnlyField(source="product.selling_price")
    cost_price = serializers.ReadOnlyField(source="product.cost_price")

    class Meta:
        model = BranchInventory
        fields = "__all__"


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="branch_inventory.product.name")
    performed_by_name = serializers.ReadOnlyField(source="performed_by.full_name")

    class Meta:
        model = StockMovement
        fields = "__all__"


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"


# Billing Serializers
class PaymentSerializer(serializers.ModelSerializer):
    received_by_name = serializers.ReadOnlyField(source="received_by.full_name")

    class Meta:
        model = Payment
        fields = "__all__"


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = "__all__"


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    customer_name = serializers.ReadOnlyField(source="customer.full_name")
    customer_phone = serializers.ReadOnlyField(source="customer.phone")
    branch_name = serializers.ReadOnlyField(source="branch.name")
    balance_due = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = "__all__"


class RefundSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.ReadOnlyField(source="approved_by.full_name")

    class Meta:
        model = Refund
        fields = "__all__"


class ExpenseSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.ReadOnlyField(source="recorded_by.full_name")
    branch_name = serializers.ReadOnlyField(source="branch.name")

    class Meta:
        model = Expense
        fields = "__all__"


class CashRegisterSessionSerializer(serializers.ModelSerializer):
    opened_by_name = serializers.ReadOnlyField(source="opened_by.full_name")
    closed_by_name = serializers.ReadOnlyField(source="closed_by.full_name")

    class Meta:
        model = CashRegisterSession
        fields = "__all__"


class MessageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageLog
        fields = "__all__"


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.ReadOnlyField(source="actor.full_name")

    class Meta:
        model = AuditLog
        fields = "__all__"
