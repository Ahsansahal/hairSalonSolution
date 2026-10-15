from rest_framework import permissions
from .models import User, UserBranchRole


class IsPlatformAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.system_role == User.SystemRole.PLATFORM_ADMIN)


class IsBusinessOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.system_role in (
            User.SystemRole.PLATFORM_ADMIN,
            User.SystemRole.BUSINESS_OWNER,
        )


class IsBranchAuthorized(permissions.BasePermission):
    """
    Ensures user belongs to the tenant, and if branch-specific:
    - Platform admin and Business owners can access all branches within their tenant.
    - Other staff roles must have an active UserBranchRole for the requested branch.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.system_role == User.SystemRole.PLATFORM_ADMIN:
            return True
        
        if request.user.system_role == User.SystemRole.BUSINESS_OWNER:
            return True

        branch_id = (
            request.query_params.get("branch_id")
            or request.data.get("branch_id")
            or request.data.get("branch")
            or view.kwargs.get("branch_id")
        )
        
        # If no explicit branch is specified or "all" is requested, allow into view (queryset will isolate allowed branches)
        if not branch_id or branch_id == "all":
            return True

        return UserBranchRole.objects.filter(
            user=request.user,
            branch_id=branch_id,
            is_active=True,
        ).exists()

    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.system_role == User.SystemRole.PLATFORM_ADMIN:
            return True

        # Check tenant isolation
        obj_tenant_id = getattr(obj, "tenant_id", None)
        if obj_tenant_id and str(obj_tenant_id) != str(request.user.tenant_id):
            return False

        if request.user.system_role == User.SystemRole.BUSINESS_OWNER:
            return True

        # Check branch isolation
        branch_id = getattr(obj, "branch_id", None)
        if not branch_id and hasattr(obj, "branch"):
            branch_id = obj.branch.id if obj.branch else None

        if branch_id:
            return UserBranchRole.objects.filter(
                user=request.user,
                branch_id=branch_id,
                is_active=True,
            ).exists()

        return True


class IsManagerOrOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.system_role in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER):
            return True
        
        return UserBranchRole.objects.filter(
            user=request.user,
            role=UserBranchRole.Role.BRANCH_MANAGER,
            is_active=True,
        ).exists()


class IsAccountantOrHigher(permissions.BasePermission):
    """
    Payroll & Salary permission:
    - Owners & Accountants: Full access (create, modify, finalize, view).
    - Branch Managers: Read-only access (GET/HEAD/OPTIONS) to audit staff salaries, overtime, and payment balances for their branch.
    - Managers CANNOT change, create, or finalize payroll runs.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.system_role in (User.SystemRole.PLATFORM_ADMIN, User.SystemRole.BUSINESS_OWNER):
            return True
        
        is_accountant = UserBranchRole.objects.filter(
            user=request.user,
            role=UserBranchRole.Role.ACCOUNTANT,
            is_active=True,
        ).exists()
        if is_accountant:
            return True

        # Branch managers have READ-ONLY rights to look after salaries, overtime, paid & remaining balances
        if request.method in permissions.SAFE_METHODS:
            return UserBranchRole.objects.filter(
                user=request.user,
                role=UserBranchRole.Role.BRANCH_MANAGER,
                is_active=True,
            ).exists()

        # Mutating actions (POST, PUT, PATCH, DELETE) are forbidden for Branch Managers
        return False
