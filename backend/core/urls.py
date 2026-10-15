from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomLoginView, MeView, BranchViewSet, DashboardSummaryView,
    ServiceViewSet, BranchServiceViewSet, StaffProfileViewSet, StaffShiftViewSet,
    StaffTimeOffViewSet, AppointmentViewSet, PublicBranchesView, PublicCatalogView,
    PublicAvailabilityView, PublicBookView, PublicBookingLookupView,
    PublicBookingCancelView, PublicBookingRescheduleView, WhatsAppWebhookView,
    WhatsAppSimulateView, BiometricDeviceViewSet, BiometricIngestView,
    AttendanceSummaryViewSet, AttendanceAdjustmentViewSet, SalaryRuleViewSet,
    CommissionRuleViewSet, PayrollRunViewSet, ProductViewSet,
    BranchInventoryViewSet, StockMovementViewSet, InvoiceViewSet,
    ExpenseViewSet, CashRegisterSessionViewSet, CustomerViewSet,
    DailySalesReportView
)

router = DefaultRouter()
router.register(r"branches", BranchViewSet, basename="branch")
router.register(r"services", ServiceViewSet, basename="service")
router.register(r"branch-services", BranchServiceViewSet, basename="branch-service")
router.register(r"staff", StaffProfileViewSet, basename="staff")
router.register(r"shifts", StaffShiftViewSet, basename="shift")
router.register(r"time-offs", StaffTimeOffViewSet, basename="time-off")
router.register(r"appointments", AppointmentViewSet, basename="appointment")
router.register(r"customers", CustomerViewSet, basename="customer")

router.register(r"attendance/devices", BiometricDeviceViewSet, basename="biometric-device")
router.register(r"attendance/summaries", AttendanceSummaryViewSet, basename="attendance-summary")
router.register(r"attendance/adjustments", AttendanceAdjustmentViewSet, basename="attendance-adjustment")

router.register(r"payroll/salary-rules", SalaryRuleViewSet, basename="salary-rule")
router.register(r"payroll/commission-rules", CommissionRuleViewSet, basename="commission-rule")
router.register(r"payroll/runs", PayrollRunViewSet, basename="payroll-run")

router.register(r"inventory/products", ProductViewSet, basename="inventory-product")
router.register(r"inventory/stocks", BranchInventoryViewSet, basename="inventory-stock")
router.register(r"inventory/movements", StockMovementViewSet, basename="inventory-movement")

router.register(r"billing/invoices", InvoiceViewSet, basename="billing-invoice")
router.register(r"billing/expenses", ExpenseViewSet, basename="billing-expense")
router.register(r"billing/cash-sessions", CashRegisterSessionViewSet, basename="billing-cash-session")

urlpatterns = [
    # Auth
    path("auth/login/", CustomLoginView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),

    # Dashboard Real-Time Summary & Executive Sales Reports
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("reports/daily-sales/", DailySalesReportView.as_view(), name="reports-daily-sales"),

    # Public Customer Booking Portal
    path("public/branches/", PublicBranchesView.as_view(), name="public-branches"),
    path("public/catalog/", PublicCatalogView.as_view(), name="public-catalog"),
    path("public/availability/", PublicAvailabilityView.as_view(), name="public-availability"),
    path("public/bookings/", PublicBookView.as_view(), name="public-book"),
    path("public/bookings/<str:reference>/", PublicBookingLookupView.as_view(), name="public-booking-lookup"),
    path("public/bookings/<str:reference>/cancel/", PublicBookingCancelView.as_view(), name="public-booking-cancel"),
    path("public/bookings/<str:reference>/reschedule/", PublicBookingRescheduleView.as_view(), name="public-booking-reschedule"),

    # WhatsApp Integration & Interactive Simulator
    path("webhooks/whatsapp/", WhatsAppWebhookView.as_view(), name="whatsapp-webhook"),
    path("webhooks/whatsapp/simulate/", WhatsAppSimulateView.as_view(), name="whatsapp-simulate"),

    # Biometric Attendance Ingestion
    path("attendance/events/ingest/", BiometricIngestView.as_view(), name="biometric-ingest"),

    # Router ViewSets
    path("", include(router.urls)),
]
