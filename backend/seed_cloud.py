import os
import sys
import django
from decimal import Decimal

# Ensure python path includes backend
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from core.models import (
    Tenant, Branch, UserBranchRole, Service, BranchService,
    StaffProfile, StaffBranchAssignment, StaffService, Customer
)

User = get_user_model()

def run_seed():
    print("[*] Seeding SHAY Salon & Spa Cloud Database...")

    # 1. Tenant
    tenant = Tenant.objects.filter(name="Shay Salon & Spa").first()
    if not tenant:
        tenant = Tenant.objects.create(
            name="Shay Salon & Spa",
            subdomain="shay",
            country="PK",
            currency="PKR",
            timezone="Asia/Karachi",
        )

    # 2. Branches
    clifton = Branch.objects.filter(tenant=tenant, name="Clifton Flagship Branch").first()
    if not clifton:
        clifton = Branch.objects.create(
            tenant=tenant,
            name="Clifton Flagship Branch",
            code="CLF-01",
            city="Karachi",
            address="Block 4, Clifton, Near Bilawal House",
            phone="+92 21 35870000",
            email="clifton@shay.salon",
        )

    dha = Branch.objects.filter(tenant=tenant, name="DHA Bukhari Studio").first()
    if not dha:
        dha = Branch.objects.create(
            tenant=tenant,
            name="DHA Bukhari Studio",
            code="DHA-02",
            city="Karachi",
            address="Bukhari Commercial Lane 3, Phase 6",
            phone="+92 21 35840000",
            email="dha@shay.salon",
        )

    # 3. Users
    users_data = [
        ("owner@shay.salon", "Shayan Merchant", User.SystemRole.BUSINESS_OWNER, None, None),
        ("accountant@shay.salon", "Farhan Siddiqui", User.SystemRole.STAFF, clifton, UserBranchRole.Role.ACCOUNTANT),
        ("manager.clifton@shay.salon", "Zainab Tariq", User.SystemRole.STAFF, clifton, UserBranchRole.Role.BRANCH_MANAGER),
        ("manager.dha@shay.salon", "Hamza Abbasi", User.SystemRole.STAFF, dha, UserBranchRole.Role.BRANCH_MANAGER),
        ("reception.clifton@shay.salon", "Ayesha Khan", User.SystemRole.STAFF, clifton, UserBranchRole.Role.RECEPTIONIST),
        ("reception.dha@shay.salon", "Hira Munir", User.SystemRole.STAFF, dha, UserBranchRole.Role.RECEPTIONIST),
        ("aliya.rizvi@shay.salon", "Aliya Rizvi", User.SystemRole.STAFF, None, None), # Floor staff
    ]

    for email, full_name, sys_role, branch, branch_role in users_data:
        u, created = User.objects.get_or_create(
            email=email,
            defaults={"full_name": full_name, "system_role": sys_role}
        )
        u.set_password("SalonPass123!")
        u.save()

        if branch and branch_role:
            UserBranchRole.objects.get_or_create(
                user=u,
                branch=branch,
                defaults={"role": branch_role, "is_active": True}
            )

    # 4. Staff Profiles
    staff_data = [
        ("EMP-001", "Aliya Rizvi", "Senior Creative Stylist", clifton),
        ("EMP-002", "Tariq Mehmood", "Master Barber & Beard Architect", clifton),
        ("EMP-003", "Dr. Sana Hashmi", "Clinical Esthetician", clifton),
        ("EMP-004", "Bilal Qureshi", "Lead Colorist & Texture Specialist", dha),
        ("EMP-005", "Mehak Fatima", "Bridal & Hair Spa Director", dha),
    ]

    staff_objs = []
    for code, name, title, branch in staff_data:
        sp, _ = StaffProfile.objects.get_or_create(
            tenant=tenant,
            employee_code=code,
            defaults={"full_name": name, "title": title, "is_active": True}
        )
        StaffBranchAssignment.objects.get_or_create(
            staff=sp,
            branch=branch,
            defaults={"is_primary": True, "is_active": True}
        )
        staff_objs.append(sp)

    # 5. Karachi Signature Deals & Services
    services_data = [
        ("SHAY Deal 01: Executive Grooming Suite", "Deals & Packages", 4500, 60, "Signature Precision Haircut + Organic Charcoal Beard Sculpting + Rejuvenating Scalp Cleanse + Hot Towel Refreshment. (Valued at Rs. 6,500 · Save 31%)"),
        ("SHAY Deal 02: Hydra-Refresh & Hair Spa Ritual", "Deals & Packages", 9800, 90, "Deep Pore Hydra-Glow Facial + Restorative Scalp Ritual & Hair Spa Mask + Neck & Shoulder Tension Release + Moroccan Argan Gloss. (Valued at Rs. 15,000 · Save 35%)"),
        ("SHAY Deal 03: Royal Wedding Groom Package", "Wedding & Groom Packages", 19500, 150, "Complete Wedding Day Perfection: Signature Luxury Haircut & Styling + 24k Gold Infusion Facial + Hand & Foot Paraffin Reflexology Spa + Beard Architecture & Pre-Shoot Mattifying Glow. (Valued at Rs. 28,000 · Save 30%)"),
        ("SHAY Deal 04: Pure Silk Keratin & Makeover", "Deals & Packages", 22000, 180, "Formaldehyde-Free Pure Silk Keratin Treatment + Split-End Pruning & Thermal Styling + Take-Home Post-Care Serum. (Valued at Rs. 29,500 · Save 25%)"),
        ("SHAY Deal 05: Gentleman's Quick Reset", "Deals & Packages", 3200, 45, "Fast Executive Haircut + Beard Lineup & Oil Treatment + Cooling Mint Facial Cleanse. (Valued at Rs. 4,500 · Save 29%)"),
        ("SHAY Deal 06: Deluxe Spa Mani-Pedi & Head Therapy", "Deals & Packages", 5500, 75, "Therapeutic Herbal Manicure & Pedicure + Dead Sea Salt Scrub + 20-min Indian Ayurvedic Scalp Massage. (Valued at Rs. 8,000 · Save 31%)"),
        ("Signature Precision Haircut & Styling", "Hair Services", 3500, 45, "Consultation, custom scissor cut, wash, and luxury finish."),
        ("Hydra-Glow Luxury Facial", "Esthetics & Skincare", 9500, 75, "7-step deep cleansing, micro-exfoliation, serum infusion."),
        ("Full Balayage & Gloss Couture", "Hair Color", 18500, 150, "Bespoke hand-painted balayage with Olaplex bond builder."),
        ("Restorative Scalp Ritual & Hair Spa", "Body Spa", 5500, 60, "Steam infusion mask with Ayurvedic tension release massage."),
    ]

    branches = [clifton, dha]
    for name, cat, price, duration, desc in services_data:
        svc, _ = Service.objects.get_or_create(
            tenant=tenant,
            name=name,
            defaults={
                "category": cat,
                "base_price": Decimal(str(price)),
                "default_duration_minutes": duration,
                "description": desc,
                "is_active": True,
                "public_bookable": True,
            }
        )
        for b in branches:
            BranchService.objects.get_or_create(
                branch=b,
                service=svc,
                defaults={"price": Decimal(str(price)), "duration_minutes": duration, "is_available": True}
            )
        for st in staff_objs:
            StaffService.objects.get_or_create(
                staff=st,
                service=svc,
                defaults={"is_active": True}
            )

    print("[OK] Seed completed successfully! Both branches, staff, roles, and Karachi deals are ready.")

if __name__ == "__main__":
    run_seed()
