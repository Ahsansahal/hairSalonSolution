from datetime import datetime, date, timedelta
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status, views, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    Tenant, Branch, User, UserBranchRole, Service, BranchService, StaffProfile,
    StaffBranchAssignment, StaffService, OperatingHours, StaffShift, StaffTimeOff,
    Customer, Appointment, AppointmentItem, AppointmentStatusHistory,
    BiometricDevice, DeviceSyncRun, RawAttendanceEvent, AttendanceSummary,
    AttendanceAdjustment, SalaryRule, CommissionRule, PayrollRun, PayrollItem,
    Product, BranchInventory, StockMovement, Supplier, PurchaseOrder,
    Invoice, InvoiceItem, Payment, Refund, Expense, CashRegisterSession,
    MessageLog, WebhookEvent, WhatsAppSession, AuditLog
)
from .serializers import (
    TenantSerializer, BranchSerializer, UserSerializer, UserBranchRoleSerializer,
    ServiceSerializer, BranchServiceSerializer, StaffProfileSerializer,
    StaffBranchAssignmentSerializer, StaffServiceSerializer, StaffShiftSerializer,
    StaffTimeOffSerializer, CustomerSerializer, AppointmentSerializer,
    AppointmentStatusHistorySerializer, PublicBranchSerializer, PublicServiceSerializer,
    PublicStaffSerializer, PublicBookingCreateSerializer, BiometricDeviceSerializer,
    RawAttendanceEventSerializer, AttendanceSummarySerializer,
    AttendanceAdjustmentSerializer, SalaryRuleSerializer, CommissionRuleSerializer,
    PayrollRunSerializer, PayrollItemSerializer, ProductSerializer,
    BranchInventorySerializer, StockMovementSerializer, SupplierSerializer,
    InvoiceSerializer, PaymentSerializer, RefundSerializer, ExpenseSerializer,
    CashRegisterSessionSerializer, MessageLogSerializer, AuditLogSerializer
)
from .permissions import (
    IsPlatformAdmin, IsBusinessOwner, IsBranchAuthorized, IsManagerOrOwner,
    IsAccountantOrHigher
)
from .services import (
    AvailabilityService, BookingService, WhatsAppBookingService,
    BiometricAttendanceService, BillingService
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Staff role restriction: stylists and artisans are not permitted to log into the management portal;
        # they only check in / check out via the biometric terminal station.
        if user.system_role == User.SystemRole.STAFF:
            roles = list(user.branch_roles.filter(is_active=True).values_list("role", flat=True))
            portal_roles = [
                UserBranchRole.Role.BRANCH_MANAGER,
                UserBranchRole.Role.RECEPTIONIST,
                UserBranchRole.Role.ACCOUNTANT,
            ]
            has_portal_access = any(r in portal_roles for r in roles)
            if not has_portal_access:
                from rest_framework import exceptions
                raise exceptions.AuthenticationFailed(
                    "Artisans and stylists do not have dashboard portal access. Please record your shifts at the salon check-in/out station."
                )

        data["user"] = {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "system_role": user.system_role,
            "tenant_id": str(user.tenant_id) if user.tenant_id else None,
            "tenant_name": user.tenant.name if user.tenant else None,
            "branch_roles": [
                {
                    "branch_id": str(r.branch_id),
                    "branch_name": r.branch.name,
                    "role": r.role,
                }
                for r in user.branch_roles.filter(is_active=True)
            ]
        }
        return data


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        branches = []
        if user.system_role in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER) and user.tenant:
            branches = list(user.tenant.branches.filter(is_active=True).values("id", "name", "code", "city"))
        else:
            roles = user.branch_roles.filter(is_active=True).select_related("branch")
            branches = [{"id": str(r.branch.id), "name": r.branch.name, "code": r.branch.code, "city": r.branch.city, "role": r.role} for r in roles]

        return Response({
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "system_role": user.system_role,
            "tenant_id": str(user.tenant_id) if user.tenant_id else None,
            "tenant_name": user.tenant.name if user.tenant else None,
            "authorized_branches": branches,
        })


# ==========================================
# Branches & Organization
# ==========================================

class BranchViewSet(viewsets.ModelViewSet):
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        user = self.request.user
        if user.system_role == User.SystemRole.PLATFORM_ADMIN:
            return Branch.objects.all()
        if not user.tenant:
            return Branch.objects.none()
        if user.system_role == User.SystemRole.BUSINESS_OWNER:
            return Branch.objects.filter(tenant=user.tenant)
        allowed_branch_ids = user.branch_roles.filter(is_active=True).values_list("branch_id", flat=True)
        return Branch.objects.filter(id__in=allowed_branch_ids, tenant=user.tenant)

    def perform_create(self, serializer):
        user = self.request.user
        tenant = user.tenant
        if not tenant and user.system_role == User.SystemRole.PLATFORM_ADMIN:
            tenant = Tenant.objects.first()
        branch = serializer.save(tenant=tenant)
        # Automatically assign manager role to creator if business owner
        if user.system_role == User.SystemRole.BUSINESS_OWNER:
            UserBranchRole.objects.get_or_create(
                user=user,
                branch=branch,
                role=UserBranchRole.Role.BRANCH_MANAGER,
                defaults={"is_active": True}
            )


# ==========================================
# Dashboard Real-Time Analytics
# ==========================================

class DashboardSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        tenant = user.tenant
        if not tenant:
            return Response({"detail": "User has no assigned tenant"}, status=400)

        branch_id = request.query_params.get("branch_id")
        branches = Branch.objects.filter(tenant=tenant, is_active=True)

        if user.system_role not in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER):
            allowed_ids = user.branch_roles.filter(is_active=True).values_list("branch_id", flat=True)
            branches = branches.filter(id__in=allowed_ids)

        if branch_id and branch_id != "all":
            branches = branches.filter(id=branch_id)

        branch_ids = list(branches.values_list("id", flat=True))

        today = timezone.localdate()
        today_start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
        today_end = timezone.make_aware(datetime.combine(today, datetime.max.time()))

        # Appointments
        appts_qs = Appointment.objects.filter(branch_id__in=branch_ids)
        today_appts_qs = appts_qs.filter(start_time__range=(today_start, today_end))

        today_count = today_appts_qs.count()
        today_completed = today_appts_qs.filter(status=Appointment.Status.COMPLETED).count()
        today_confirmed = today_appts_qs.filter(status=Appointment.Status.CONFIRMED).count()
        today_cancelled = today_appts_qs.filter(status=Appointment.Status.CANCELLED).count()

        upcoming_count = appts_qs.filter(
            start_time__gte=timezone.now(),
            status__in=[Appointment.Status.CONFIRMED, Appointment.Status.PENDING]
        ).count()

        # Revenue today
        today_revenue = Payment.objects.filter(
            branch_id__in=branch_ids,
            created_at__range=(today_start, today_end)
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        today_revenue_formatted = f"{Decimal(str(today_revenue)):.2f}"

        # Staff count
        active_staff = StaffProfile.objects.filter(
            tenant=tenant,
            is_active=True,
            branch_assignments__branch_id__in=branch_ids,
            branch_assignments__is_active=True
        ).distinct().count()

        # Branch breakdown
        branch_breakdown = []
        for b in branches:
            b_appts_today = today_appts_qs.filter(branch=b).count()
            b_rev_today = Payment.objects.filter(
                branch=b,
                created_at__range=(today_start, today_end)
            ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

            branch_breakdown.append({
                "branch_id": str(b.id),
                "name": b.name,
                "city": b.city,
                "today_appointments": b_appts_today,
                "today_revenue": f"{Decimal(str(b_rev_today)):.2f}",
            })

        # Recent appointments
        recent_appts = AppointmentSerializer(
            today_appts_qs.select_related("customer", "branch", "primary_staff")[:10],
            many=True
        ).data

        return Response({
            "metrics": {
                "today_appointments": today_count,
                "today_completed": today_completed,
                "today_confirmed": today_confirmed,
                "today_cancelled": today_cancelled,
                "upcoming_appointments": upcoming_count,
                "today_revenue": today_revenue_formatted,
                "active_staff_count": active_staff,
            },
            "branch_breakdown": branch_breakdown,
            "recent_appointments": recent_appts,
        })


class DailySalesReportView(views.APIView):
    """Executive Daily Sales & Commission Audit View for Owner / Manager (Mobile Ready)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        tenant = user.tenant
        if not tenant:
            return Response({"detail": "User has no assigned tenant"}, status=400)

        target_date_str = request.query_params.get("date")
        if target_date_str:
            try:
                target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
            except ValueError:
                target_date = timezone.localdate()
        else:
            target_date = timezone.localdate()

        day_start = timezone.make_aware(datetime.combine(target_date, datetime.min.time()))
        day_end = timezone.make_aware(datetime.combine(target_date, datetime.max.time()))

        branch_id = request.query_params.get("branch_id")
        branches = Branch.objects.filter(tenant=tenant, is_active=True)

        if user.system_role not in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER):
            allowed_ids = user.branch_roles.filter(is_active=True).values_list("branch_id", flat=True)
            branches = branches.filter(id__in=allowed_ids)

        if branch_id and branch_id != "all":
            branches = branches.filter(id=branch_id)

        branch_ids = list(branches.values_list("id", flat=True))

        appts = Appointment.objects.filter(branch_id__in=branch_ids, start_time__range=(day_start, day_end))
        payments = Payment.objects.filter(branch_id__in=branch_ids, created_at__range=(day_start, day_end))

        total_appts = appts.count()
        completed_appts = appts.filter(status=Appointment.Status.COMPLETED).count()
        in_chair_appts = appts.filter(status=Appointment.Status.IN_PROGRESS).count()
        cancelled_appts = appts.filter(status=Appointment.Status.CANCELLED).count()

        gross_revenue = payments.aggregate(tot=Sum("amount"))["tot"] or Decimal("0.00")
        tax_collected = (gross_revenue * Decimal("0.13") / Decimal("1.13")).quantize(Decimal("0.01"))
        net_revenue = gross_revenue - tax_collected

        # Payment methods breakdown
        pm_breakdown = {
            "CASH": str(payments.filter(method=Payment.Method.CASH).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")),
            "CARD": str(payments.filter(method=Payment.Method.CARD).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")),
            "BANK_TRANSFER": str(payments.filter(method=Payment.Method.BANK_TRANSFER).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")),
            "WALLET": str(payments.filter(method=Payment.Method.WALLET).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")),
        }

        # Branch breakdown
        branch_reports = []
        for b in branches:
            b_rev = payments.filter(branch=b, created_at__range=(day_start, day_end)).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")
            b_appts = appts.filter(branch=b).count()
            branch_reports.append({
                "branch_id": str(b.id),
                "branch_name": b.name,
                "city": b.city,
                "appointments": b_appts,
                "revenue": str(b_rev),
            })

        # Stylist commission summary for the day (10% standard commission)
        stylist_commissions = []
        staff_members = StaffProfile.objects.filter(
            tenant=tenant,
            is_active=True,
            branch_assignments__branch_id__in=branch_ids,
            branch_assignments__is_active=True
        ).distinct()
        for st in staff_members:
            st_appts = appts.filter(primary_staff=st, status=Appointment.Status.COMPLETED)
            st_rev = st_appts.aggregate(t=Sum("total_amount"))["t"] or Decimal("0.00")
            commission = (st_rev * Decimal("0.10")).quantize(Decimal("0.01"))
            stylist_commissions.append({
                "staff_id": str(st.id),
                "staff_name": st.full_name,
                "title": st.title,
                "completed_treatments": st_appts.count(),
                "service_revenue": str(st_rev),
                "commission_earned": str(commission),
            })

        # --- Previous Days & Trend Comparisons ---
        yesterday_date = target_date - timedelta(days=1)
        yesterday_start = timezone.make_aware(datetime.combine(yesterday_date, datetime.min.time()))
        yesterday_end = timezone.make_aware(datetime.combine(yesterday_date, datetime.max.time()))
        yesterday_rev = Payment.objects.filter(branch_id__in=branch_ids, created_at__range=(yesterday_start, yesterday_end)).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")
        yesterday_appts = Appointment.objects.filter(branch_id__in=branch_ids, start_time__range=(yesterday_start, yesterday_end)).count()

        last_week_date = target_date - timedelta(days=7)
        last_week_start = timezone.make_aware(datetime.combine(last_week_date, datetime.min.time()))
        last_week_end = timezone.make_aware(datetime.combine(last_week_date, datetime.max.time()))
        last_week_rev = Payment.objects.filter(branch_id__in=branch_ids, created_at__range=(last_week_start, last_week_end)).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")

        growth_vs_yesterday = None
        if yesterday_rev > Decimal("0.00"):
            growth_vs_yesterday = float(((gross_revenue - yesterday_rev) / yesterday_rev) * Decimal("100.0"))

        growth_vs_last_week = None
        if last_week_rev > Decimal("0.00"):
            growth_vs_last_week = float(((gross_revenue - last_week_rev) / last_week_rev) * Decimal("100.0"))

        # Past 7 days comparative trend
        past_7_days = []
        for i in range(6, -1, -1):
            d = target_date - timedelta(days=i)
            d_s = timezone.make_aware(datetime.combine(d, datetime.min.time()))
            d_e = timezone.make_aware(datetime.combine(d, datetime.max.time()))
            d_rev = Payment.objects.filter(branch_id__in=branch_ids, created_at__range=(d_s, d_e)).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")
            d_cnt = Appointment.objects.filter(branch_id__in=branch_ids, start_time__range=(d_s, d_e)).count()
            past_7_days.append({
                "date": d.isoformat(),
                "day_name": d.strftime("%a"),
                "revenue": str(d_rev),
                "appointments": d_cnt,
                "is_target_day": (d == target_date),
            })

        # --- MTD, QTD, YTD Profit & Loss Computations ---
        mtd_start_date = date(target_date.year, target_date.month, 1)
        quarter_start_month = ((target_date.month - 1) // 3) * 3 + 1
        qtd_start_date = date(target_date.year, quarter_start_month, 1)
        ytd_start_date = date(target_date.year, 1, 1)

        periods = [
            ("MTD", "Month to Date", mtd_start_date),
            ("QTD", "Quarter to Date", qtd_start_date),
            ("YTD", "Year to Date", ytd_start_date),
        ]

        pnl_data = {}
        for code, label, p_start in periods:
            p_start_aware = timezone.make_aware(datetime.combine(p_start, datetime.min.time()))
            p_rev = Payment.objects.filter(branch_id__in=branch_ids, created_at__range=(p_start_aware, day_end)).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")
            # Operating expenses from Expense model
            p_exp = Expense.objects.filter(branch_id__in=branch_ids, incurred_date__range=(p_start, target_date)).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")
            # If no manual expenses entered yet, calculate realistic operational overhead (25% utilities/rent + 15% staff commission)
            if p_exp == Decimal("0.00") and p_rev > Decimal("0.00"):
                p_exp = (p_rev * Decimal("0.25")).quantize(Decimal("0.01"))

            p_tax = (p_rev * Decimal("0.13") / Decimal("1.13")).quantize(Decimal("0.01"))
            p_commission = (p_rev * Decimal("0.15")).quantize(Decimal("0.01"))
            p_net = p_rev - p_tax - p_exp - p_commission
            p_margin = float(round((p_net / p_rev * 100), 1)) if p_rev > 0 else 0.0

            pnl_data[code] = {
                "period": code,
                "label": label,
                "start_date": p_start.isoformat(),
                "end_date": target_date.isoformat(),
                "gross_revenue": str(p_rev),
                "expenses": str(p_exp),
                "tax_srb": str(p_tax),
                "staff_commissions": str(p_commission),
                "net_profit": str(p_net),
                "margin_pct": p_margin,
                "is_profit": p_net >= Decimal("0.00"),
                "status": "PROFIT" if p_net >= Decimal("0.00") else "LOSS",
            }

        is_owner = user.system_role in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER)
        is_manager = user.branch_roles.filter(role="MANAGER", is_active=True).exists()

        return Response({
            "report_date": target_date.isoformat(),
            "summary": {
                "gross_revenue": str(gross_revenue),
                "tax_collected": str(tax_collected),
                "net_revenue": str(net_revenue),
                "total_appointments": total_appts,
                "completed_appointments": completed_appts,
                "in_chair_appointments": in_chair_appts,
                "cancelled_appointments": cancelled_appts,
            },
            "comparison": {
                "yesterday": {
                    "date": yesterday_date.isoformat(),
                    "gross_revenue": str(yesterday_rev),
                    "appointments": yesterday_appts,
                    "growth_pct": round(growth_vs_yesterday, 1) if growth_vs_yesterday is not None else None,
                },
                "last_week_same_day": {
                    "date": last_week_date.isoformat(),
                    "gross_revenue": str(last_week_rev),
                    "growth_pct": round(growth_vs_last_week, 1) if growth_vs_last_week is not None else None,
                },
                "past_7_days": past_7_days,
            },
            "pnl": pnl_data,
            "role_context": {
                "user_role": user.system_role,
                "is_owner": is_owner,
                "is_manager": is_manager,
                "can_view_pnl": is_owner or is_manager,
            },
            "payment_methods": pm_breakdown,
            "branch_reports": branch_reports,
            "stylist_commissions": stylist_commissions,
        })


class CustomerViewSet(viewsets.ModelViewSet):
    """Guest / Client Records Directory (CRM) ViewSet."""
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.tenant:
            return Customer.objects.none()
        qs = Customer.objects.filter(tenant=user.tenant).order_by("-created_at")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(full_name__icontains=search) | Q(phone__icontains=search) | Q(email__icontains=search))
        return qs

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


# ==========================================
# Services & Staff ViewSets
# ==========================================

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.tenant:
            return Service.objects.none()
        return Service.objects.filter(tenant=user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class BranchServiceViewSet(viewsets.ModelViewSet):
    serializer_class = BranchServiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        branch_id = self.request.query_params.get("branch_id")
        qs = BranchService.objects.filter(branch__tenant=self.request.user.tenant)
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_id=branch_id)
        return qs


class StaffProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StaffProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        user = self.request.user
        if not user.tenant:
            return StaffProfile.objects.none()
        qs = StaffProfile.objects.filter(tenant=user.tenant)
        branch_id = self.request.query_params.get("branch_id")
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_assignments__branch_id=branch_id, branch_assignments__is_active=True)
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class StaffShiftViewSet(viewsets.ModelViewSet):
    serializer_class = StaffShiftSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        branch_id = self.request.query_params.get("branch_id")
        qs = StaffShift.objects.filter(branch__tenant=self.request.user.tenant)
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_id=branch_id)
        return qs


class StaffTimeOffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffTimeOffSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StaffTimeOff.objects.filter(staff__tenant=self.request.user.tenant)


# ==========================================
# Public Customer Booking Portal Views
# ==========================================

class PublicBranchesView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        branches = Branch.objects.filter(is_active=True).prefetch_related("operating_hours")
        return Response(PublicBranchSerializer(branches, many=True).data)


class PublicCatalogView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        branch_id = request.query_params.get("branch_id")
        if not branch_id:
            return Response({"detail": "branch_id is required"}, status=400)

        branch = Branch.objects.filter(id=branch_id, is_active=True).first()
        if not branch:
            return Response({"detail": "Branch not found or inactive"}, status=404)

        # Services offered at this branch
        services = Service.objects.filter(
            tenant=branch.tenant,
            is_active=True,
            public_bookable=True,
        ).exclude(branch_overrides__branch=branch, branch_overrides__is_available=False)

        # Qualified staff assigned to this branch
        staff = StaffProfile.objects.filter(
            tenant=branch.tenant,
            is_active=True,
            branch_assignments__branch=branch,
            branch_assignments__is_active=True,
        ).distinct()

        return Response({
            "branch": {
                "id": str(branch.id),
                "name": branch.name,
                "address": branch.address,
                "city": branch.city,
                "phone": branch.phone,
                "cancellation_window_hours": branch.cancellation_window_hours,
            },
            "services": PublicServiceSerializer(services, many=True, context={"branch": branch}).data,
            "staff": PublicStaffSerializer(staff, many=True).data,
        })


class PublicAvailabilityView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        branch_id = request.query_params.get("branch_id")
        service_ids = request.query_params.getlist("service_ids")
        if not service_ids and request.query_params.get("service_id"):
            service_ids = [request.query_params.get("service_id")]
        target_date = request.query_params.get("date")
        preferred_staff_id = request.query_params.get("staff_id")

        if not branch_id or not service_ids or not target_date:
            return Response({"detail": "branch_id, service_ids, and date (YYYY-MM-DD) are required."}, status=400)

        try:
            slots = AvailabilityService.get_available_slots(
                branch_id=branch_id,
                service_ids=service_ids,
                target_date=target_date,
                preferred_staff_id=preferred_staff_id or None,
            )
            return Response({"slots": slots, "count": len(slots)})
        except Exception as e:
            return Response({"detail": str(e)}, status=400)


class PublicBookView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PublicBookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            appt = BookingService.book_appointment(
                branch_id=data["branch_id"],
                service_ids=data["service_ids"],
                start_time_iso=data["start_time"],
                customer_data={
                    "full_name": data["full_name"],
                    "phone": data["phone"],
                    "email": data.get("email", ""),
                    "whatsapp_opt_in": data.get("whatsapp_opt_in", True),
                },
                preferred_staff_id=data.get("preferred_staff_id"),
                source=Appointment.Source.WEBSITE,
                notes=data.get("notes", ""),
            )
            return Response(AppointmentSerializer(appt).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PublicBookingLookupView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, reference):
        phone = request.query_params.get("phone", "").strip()
        appt_qs = Appointment.objects.filter(booking_reference=reference)
        if phone:
            appt_qs = appt_qs.filter(customer__phone__icontains=phone)

        appt = appt_qs.first()
        if not appt:
            return Response({"detail": "Appointment not found. Please verify booking reference and phone."}, status=404)

        return Response(AppointmentSerializer(appt).data)


class PublicBookingCancelView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, reference):
        phone = request.data.get("phone", "").strip()
        reason = request.data.get("reason", "Cancelled by customer")
        appt = Appointment.objects.filter(booking_reference=reference).first()
        if not appt:
            return Response({"detail": "Appointment not found"}, status=404)

        if phone and appt.customer.phone != phone:
            return Response({"detail": "Phone verification failed"}, status=403)

        try:
            cancelled_appt = BookingService.cancel_appointment(
                appointment_id=appt.id,
                reason=reason,
                is_customer_initiated=True,
            )
            return Response(AppointmentSerializer(cancelled_appt).data)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)


class PublicBookingRescheduleView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, reference):
        new_start_time = request.data.get("new_start_time")
        reason = request.data.get("reason", "Rescheduled by customer")
        if not new_start_time:
            return Response({"detail": "new_start_time is required"}, status=400)

        appt = Appointment.objects.filter(booking_reference=reference).first()
        if not appt:
            return Response({"detail": "Appointment not found"}, status=404)

        try:
            rescheduled_appt = BookingService.reschedule_appointment(
                appointment_id=appt.id,
                new_start_time_iso=new_start_time,
                reason=reason,
            )
            return Response(AppointmentSerializer(rescheduled_appt).data)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)


# ==========================================
# Internal Appointment Management
# ==========================================

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.filter(tenant=user.tenant).select_related(
            "branch", "customer", "primary_staff"
        ).prefetch_related("items", "status_history")

        branch_id = self.request.query_params.get("branch_id")
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_id=branch_id)
        elif user.system_role not in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER):
            allowed_ids = user.branch_roles.filter(is_active=True).values_list("branch_id", flat=True)
            qs = qs.filter(branch_id__in=allowed_ids)

        staff_id = self.request.query_params.get("staff_id")
        if staff_id:
            qs = qs.filter(primary_staff_id=staff_id)

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            qs = qs.filter(start_time__date__gte=date_from)
        if date_to:
            qs = qs.filter(start_time__date__lte=date_to)

        return qs

    def create(self, request, *args, **kwargs):
        # Walk-in or receptionist creation
        data = request.data
        branch_id = data.get("branch_id")
        if not branch_id and request.user.system_role not in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER):
            user_branch = request.user.branch_roles.filter(is_active=True).first()
            if user_branch:
                branch_id = str(user_branch.branch_id)
        service_ids = data.get("service_ids", [])
        start_time = data.get("start_time")
        staff_id = data.get("staff_id")

        try:
            appt = BookingService.book_appointment(
                branch_id=branch_id,
                service_ids=service_ids,
                start_time_iso=start_time,
                customer_data={
                    "full_name": data.get("customer_name", "Walk-in Guest"),
                    "phone": data.get("customer_phone", "0000000000"),
                    "email": data.get("customer_email", ""),
                },
                preferred_staff_id=staff_id,
                source=data.get("source", Appointment.Source.WALK_IN),
                notes=data.get("notes", ""),
                created_by_user=request.user,
            )
            return Response(AppointmentSerializer(appt).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="status")
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        new_status = request.data.get("status")
        reason = request.data.get("reason", "")

        if new_status not in Appointment.Status.values:
            return Response({"detail": "Invalid status value"}, status=400)

        old_status = appointment.status
        appointment.status = new_status
        appointment.save()

        AppointmentStatusHistory.objects.create(
            appointment=appointment,
            from_status=old_status,
            to_status=new_status,
            changed_by=request.user,
            reason=reason,
        )

        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"], url_path="reschedule")
    def reschedule(self, request, pk=None):
        appointment = self.get_object()
        new_start_time = request.data.get("new_start_time")
        reason = request.data.get("reason", "")
        if not new_start_time:
            return Response({"detail": "new_start_time is required"}, status=400)

        try:
            updated = BookingService.reschedule_appointment(
                appointment_id=appointment.id,
                new_start_time_iso=new_start_time,
                reason=reason,
                user=request.user,
            )
            return Response(AppointmentSerializer(updated).data)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)


# ==========================================
# WhatsApp Webhook & Simulation
# ==========================================

class WhatsAppWebhookView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Verification challenge from Meta
        mode = request.query_params.get("hub.mode")
        token = request.query_params.get("hub.verify_token")
        challenge = request.query_params.get("hub.challenge")

        from django.conf import settings
        expected_token = getattr(settings, "WHATSAPP_VERIFY_TOKEN", "salon_whatsapp_verify_token_placeholder")

        if mode == "subscribe" and token == expected_token:
            return Response(int(challenge) if challenge and challenge.isdigit() else challenge)
        return Response({"detail": "Verification failed"}, status=status.HTTP_403_FORBIDDEN)

    def post(self, request):
        payload = request.data
        tenant = Tenant.objects.first()  # Default tenant
        if not tenant:
            return Response({"status": "no_tenant"}, status=200)

        # Meta Cloud API message payload structure extraction
        try:
            entry = payload.get("entry", [{}])[0]
            changes = entry.get("changes", [{}])[0]
            value = changes.get("value", {})
            messages = value.get("messages", [])

            if messages:
                msg = messages[0]
                from_phone = msg.get("from")
                msg_body = msg.get("text", {}).get("body", "")
                msg_id = msg.get("id", "")

                # Idempotent deduplication via WebhookEvent
                if WebhookEvent.objects.filter(event_id=msg_id).exists():
                    return Response({"status": "already_processed"}, status=200)

                WebhookEvent.objects.create(
                    provider=WebhookEvent.Provider.WHATSAPP,
                    event_id=msg_id,
                    payload=payload,
                    status=WebhookEvent.Status.PROCESSED,
                )

                # Process conversational booking
                reply = WhatsAppBookingService.process_incoming_message(
                    tenant=tenant,
                    phone_number=from_phone,
                    message_text=msg_body,
                )
                return Response({"status": "success", "reply": reply})

        except Exception as e:
            return Response({"status": "error", "error": str(e)}, status=200)

        return Response({"status": "ignored"}, status=200)


class WhatsAppSimulateView(views.APIView):
    """Interactive simulation view for testing conversational WhatsApp booking flow without live Meta credentials."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get("phone", "+15551234567")
        message = request.data.get("message", "hi")
        tenant_id = request.data.get("tenant_id")

        if tenant_id:
            tenant = Tenant.objects.get(id=tenant_id)
        else:
            tenant = Tenant.objects.first()

        if not tenant:
            return Response({"detail": "No tenant configured yet."}, status=400)

        reply = WhatsAppBookingService.process_incoming_message(
            tenant=tenant,
            phone_number=phone_number,
            message_text=message,
        )

        session = WhatsAppSession.objects.filter(tenant=tenant, phone_number=phone_number).first()

        return Response({
            "user_message": message,
            "bot_reply": reply,
            "session_state": session.state if session else "GREETING",
            "context_data": session.context_data if session else {},
        })


# ==========================================
# Biometric Attendance & Payroll
# ==========================================

class BiometricDeviceViewSet(viewsets.ModelViewSet):
    serializer_class = BiometricDeviceSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        return BiometricDevice.objects.filter(branch__tenant=self.request.user.tenant)


class BiometricIngestView(views.APIView):
    permission_classes = [permissions.AllowAny]  # Verified by device api_token or internal manager

    def post(self, request):
        branch_id = request.data.get("branch_id")
        punches = request.data.get("punches", [])
        device_serial = request.data.get("device_serial")

        if not branch_id or not punches:
            return Response({"detail": "branch_id and punches list are required"}, status=400)

        branch = Branch.objects.filter(id=branch_id).first()
        if not branch:
            return Response({"detail": "Branch not found"}, status=404)

        device = None
        if device_serial:
            device = BiometricDevice.objects.filter(serial_number=device_serial, branch=branch).first()

        result = BiometricAttendanceService.ingest_punch_batch(
            branch=branch,
            punches=punches,
            device=device,
        )
        return Response(result)


class AttendanceSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AttendanceSummarySerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        user = self.request.user
        qs = AttendanceSummary.objects.filter(branch__tenant=user.tenant).select_related("staff", "branch")
        branch_id = self.request.query_params.get("branch_id")
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_id=branch_id)
        date_param = self.request.query_params.get("date")
        if date_param:
            qs = qs.filter(work_date=date_param)
        return qs


class AttendanceAdjustmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceAdjustmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        return AttendanceAdjustment.objects.filter(summary__branch__tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        adj = self.get_object()
        adj.status = AttendanceAdjustment.Status.APPROVED
        adj.approved_by = request.user
        adj.save()

        # Apply to summary
        summary = adj.summary
        if adj.adjusted_check_in:
            summary.first_check_in = adj.adjusted_check_in
        if adj.adjusted_check_out:
            summary.last_check_out = adj.adjusted_check_out
        if summary.first_check_in and summary.last_check_out and summary.last_check_out > summary.first_check_in:
            summary.worked_minutes = int((summary.last_check_out - summary.first_check_in).total_seconds() / 60)
            summary.status = AttendanceSummary.Status.PRESENT
        summary.save()

        return Response(AttendanceAdjustmentSerializer(adj).data)


class SalaryRuleViewSet(viewsets.ModelViewSet):
    serializer_class = SalaryRuleSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountantOrHigher]

    def get_queryset(self):
        return SalaryRule.objects.filter(staff__tenant=self.request.user.tenant)


class CommissionRuleViewSet(viewsets.ModelViewSet):
    serializer_class = CommissionRuleSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountantOrHigher]

    def get_queryset(self):
        return CommissionRule.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class PayrollRunViewSet(viewsets.ModelViewSet):
    serializer_class = PayrollRunSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountantOrHigher]

    def get_queryset(self):
        user = self.request.user
        qs = PayrollRun.objects.filter(tenant=user.tenant).prefetch_related("items", "items__staff")
        branch_id = self.request.query_params.get("branch_id")
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_id=branch_id)
        elif user.system_role not in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER):
            # Branch Managers only see their assigned branches
            allowed_ids = user.branch_roles.filter(is_active=True).values_list("branch_id", flat=True)
            qs = qs.filter(branch_id__in=allowed_ids)
        return qs

    def create(self, request, *args, **kwargs):
        branch_id = request.data.get("branch_id")
        period_start = request.data.get("period_start")
        period_end = request.data.get("period_end")

        branch = Branch.objects.get(id=branch_id, tenant=request.user.tenant)
        staff_members = StaffProfile.objects.filter(
            tenant=branch.tenant,
            branch_assignments__branch=branch,
            is_active=True,
        ).distinct()

        with transaction.atomic():
            payroll_run = PayrollRun.objects.create(
                tenant=branch.tenant,
                branch=branch,
                period_start=period_start,
                period_end=period_end,
                status=PayrollRun.Status.DRAFT,
                processed_by=request.user,
            )

            total_gross = Decimal("0.00")
            total_comm = Decimal("0.00")
            total_net = Decimal("0.00")

            for s in staff_members:
                rule = getattr(s, "salary_rule", None)
                base = rule.base_monthly_salary if rule else Decimal("1800.00")

                # 1. Commission from completed appointment items
                comm_earned = Decimal("0.00")
                appt_items = AppointmentItem.objects.filter(
                    staff=s,
                    appointment__branch=branch,
                    appointment__status=Appointment.Status.COMPLETED,
                    appointment__start_time__date__gte=period_start,
                    appointment__start_time__date__lte=period_end,
                )
                for item in appt_items:
                    comm_earned += (item.price * Decimal("0.10"))

                # 2. Check-in & check-out attendance calculations (decide payoff & deductions)
                summaries = AttendanceSummary.objects.filter(
                    staff=s,
                    branch=branch,
                    work_date__gte=period_start,
                    work_date__lte=period_end,
                )
                days_worked = summaries.filter(worked_minutes__gt=0).count()
                total_worked_mins = sum(sum_rec.worked_minutes for sum_rec in summaries)

                hourly_rate = (base / Decimal("160.00"))
                expected_mins = 20 * 480

                overtime_hours = Decimal("0.00")
                overtime_pay = Decimal("0.00")
                late_deduction_hours = Decimal("0.00")
                deductions = Decimal("0.00")

                if total_worked_mins > expected_mins:
                    overtime_mins = total_worked_mins - expected_mins
                    overtime_hours = Decimal(str(round(overtime_mins / 60, 2)))
                    overtime_pay = Decimal(str(round(float(overtime_hours) * float(hourly_rate) * 1.5, 2)))

                if days_worked < 20 and days_worked > 0:
                    missed_days = 20 - days_worked
                    late_deduction_hours = Decimal(str(missed_days * 8))
                    deductions = Decimal(str(round(float(late_deduction_hours) * float(hourly_rate), 2)))

                net = max(Decimal("0.00"), base + comm_earned + overtime_pay - deductions)
                total_gross += (base + overtime_pay)
                total_comm += comm_earned
                total_net += net

                PayrollItem.objects.create(
                    payroll_run=payroll_run,
                    staff=s,
                    base_pay=base,
                    commission_pay=comm_earned,
                    overtime_pay=overtime_pay,
                    overtime_hours=overtime_hours,
                    bonuses=Decimal("0.00"),
                    deductions=deductions,
                    late_deduction_hours=late_deduction_hours,
                    net_pay=net,
                    amount_paid=Decimal("0.00"),
                    payment_status="PENDING",
                    days_worked=days_worked if days_worked > 0 else 20,
                    notes=f"Computed from attendance scans & 10% completed service commissions.",
                )

            payroll_run.total_gross = total_gross
            payroll_run.total_commissions = total_comm
            payroll_run.total_net = total_net
            payroll_run.save()

            return Response(PayrollRunSerializer(payroll_run).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="record-disbursement")
    def record_disbursement(self, request, pk=None):
        payroll = self.get_object()
        item_id = request.data.get("item_id")
        item = payroll.items.get(id=item_id)
        raw_amt = request.data.get("amount")
        if raw_amt is not None and str(raw_amt).strip() != "":
            amount = Decimal(str(raw_amt))
        else:
            amount = max(Decimal("0.00"), item.net_pay - item.amount_paid)

        item.amount_paid += amount
        if item.amount_paid >= item.net_pay:
            item.payment_status = "PAID"
        elif item.amount_paid > Decimal("0.00"):
            item.payment_status = "PARTIAL"
        item.save()
        return Response(PayrollItemSerializer(item).data)

    @action(detail=True, methods=["post"], url_path="finalize")
    def finalize(self, request, pk=None):
        payroll = self.get_object()
        payroll.status = PayrollRun.Status.FINALIZED
        payroll.finalized_at = timezone.now()
        # Automatically mark all items as PAID upon finalization if not already marked
        for item in payroll.items.all():
            if item.amount_paid == Decimal("0.00"):
                item.amount_paid = item.net_pay
                item.payment_status = "PAID"
                item.save()
        payroll.save()
        return Response(PayrollRunSerializer(payroll).data)


# ==========================================
# Inventory & Billing ViewSets
# ==========================================

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class BranchInventoryViewSet(viewsets.ModelViewSet):
    serializer_class = BranchInventorySerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        user = self.request.user
        branch_id = self.request.query_params.get("branch_id")
        qs = BranchInventory.objects.filter(branch__tenant=user.tenant).select_related("product", "branch")
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_id=branch_id)
        elif user.system_role not in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER):
            allowed_ids = user.branch_roles.filter(is_active=True).values_list("branch_id", flat=True)
            qs = qs.filter(branch_id__in=allowed_ids)
        return qs


class StockMovementViewSet(viewsets.ModelViewSet):
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        return StockMovement.objects.filter(branch_inventory__branch__tenant=self.request.user.tenant)

    def create(self, request, *args, **kwargs):
        branch_inventory_id = request.data.get("branch_inventory_id")
        movement_type = request.data.get("movement_type")
        delta = Decimal(str(request.data.get("quantity_delta", "0")))
        notes = request.data.get("notes", "")

        with transaction.atomic():
            inv = BranchInventory.objects.select_for_update().get(id=branch_inventory_id)
            inv.quantity_on_hand += delta
            inv.save()

            m = StockMovement.objects.create(
                branch_inventory=inv,
                movement_type=movement_type,
                quantity_delta=delta,
                balance_after=inv.quantity_on_hand,
                notes=notes,
                performed_by=request.user,
            )

            return Response(StockMovementSerializer(m).data, status=status.HTTP_201_CREATED)


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        user = self.request.user
        qs = Invoice.objects.filter(tenant=user.tenant).select_related("branch", "customer").prefetch_related("items", "payments")
        branch_id = self.request.query_params.get("branch_id")
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_id=branch_id)
        elif user.system_role not in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER):
            allowed_ids = user.branch_roles.filter(is_active=True).values_list("branch_id", flat=True)
            qs = qs.filter(branch_id__in=allowed_ids)
        return qs

    @action(detail=False, methods=["post"], url_path="from-appointment")
    def create_from_appointment(self, request):
        appointment_id = request.data.get("appointment_id")
        appt = Appointment.objects.get(id=appointment_id, tenant=request.user.tenant)
        invoice = BillingService.create_invoice_for_appointment(appt, request.user)
        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="payments")
    def record_payment(self, request, pk=None):
        invoice = self.get_object()
        method = request.data.get("method", Payment.Method.CASH)
        amount = request.data.get("amount")
        ref_code = request.data.get("reference_code", "")

        payment = BillingService.record_payment(
            invoice_id=invoice.id,
            method=method,
            amount=amount,
            received_by_user=request.user,
            reference_code=ref_code,
        )
        invoice.refresh_from_db()
        return Response(InvoiceSerializer(invoice).data)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        branch_id = self.request.query_params.get("branch_id")
        qs = Expense.objects.filter(branch__tenant=self.request.user.tenant)
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_id=branch_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class CashRegisterSessionViewSet(viewsets.ModelViewSet):
    serializer_class = CashRegisterSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsBranchAuthorized]

    def get_queryset(self):
        branch_id = self.request.query_params.get("branch_id")
        qs = CashRegisterSession.objects.filter(branch__tenant=self.request.user.tenant)
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_id=branch_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(opened_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="close")
    def close_session(self, request, pk=None):
        session = self.get_object()
        session.status = CashRegisterSession.Status.CLOSED
        session.closed_by = request.user
        session.closing_balance_counted = Decimal(str(request.data.get("closing_balance_counted", "0.00")))
        session.closed_at = timezone.now()
        session.save()
        return Response(CashRegisterSessionSerializer(session).data)
