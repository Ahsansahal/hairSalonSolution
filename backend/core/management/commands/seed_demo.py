import uuid
from decimal import Decimal
from datetime import datetime, time, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import (
    Tenant, Branch, User, UserBranchRole, Service, BranchService,
    StaffProfile, StaffBranchAssignment, StaffService, OperatingHours,
    StaffShift, Product, BranchInventory, BiometricDevice, Customer,
    Appointment, AppointmentItem, AppointmentStatusHistory, Invoice,
    InvoiceItem, Payment, CashRegisterSession, SalaryRule, AttendanceSummary,
    PayrollRun, PayrollItem
)


class Command(BaseCommand):
    help = "Seed database with Shay Salon & Spa (Karachi, Pakistan) demo data"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Shay Salon (Karachi, Pakistan) demo data..."))

        # 1. Tenant: Shay Salon & Spa (Karachi)
        tenant, _ = Tenant.objects.get_or_create(
            slug="shay-salon",
            defaults={
                "name": "Shay Salon & Spa",
                "legal_name": "Shay Salon & Luxury Spa (Pvt) Ltd",
                "email": "contact@shay.salon",
                "phone": "+92-21-3587-0100",
                "default_currency": "PKR",
                "default_tax_rate": Decimal("13.00"),  # Sindh Sales Tax on Services
                "is_active": True,
            }
        )
        tenant.name = "Shay Salon & Spa"
        tenant.legal_name = "Shay Salon & Luxury Spa (Pvt) Ltd"
        tenant.default_currency = "PKR"
        tenant.save()

        # Also update old tenant if exists
        Tenant.objects.filter(slug="luxe-aura").update(
            name="Shay Salon & Spa",
            default_currency="PKR"
        )

        # 2. Branches in Karachi
        b_clifton, _ = Branch.objects.get_or_create(
            tenant=tenant,
            code="CLIF-01",
            defaults={
                "name": "Clifton Flagship Branch",
                "address": "Plot 14-C, Block 4, Clifton (near Bilawal Chowrangi)",
                "city": "Karachi",
                "phone": "+92-21-3587-0111",
                "email": "clifton@shay.salon",
                "timezone": "Asia/Karachi",
                "currency": "PKR",
                "tax_rate": Decimal("13.00"),
                "cancellation_window_hours": 24,
                "buffer_minutes": 15,
                "is_active": True,
            }
        )
        b_clifton.name = "Clifton Flagship Branch"
        b_clifton.address = "Plot 14-C, Block 4, Clifton (near Bilawal Chowrangi)"
        b_clifton.city = "Karachi"
        b_clifton.currency = "PKR"
        b_clifton.timezone = "Asia/Karachi"
        b_clifton.save()

        b_dha, _ = Branch.objects.get_or_create(
            tenant=tenant,
            code="DHA-02",
            defaults={
                "name": "DHA Bukhari Studio",
                "address": "42-C, Main Bukhari Commercial, Phase 6, DHA",
                "city": "Karachi",
                "phone": "+92-21-3584-0122",
                "email": "dha@shay.salon",
                "timezone": "Asia/Karachi",
                "currency": "PKR",
                "tax_rate": Decimal("13.00"),
                "cancellation_window_hours": 24,
                "buffer_minutes": 15,
                "is_active": True,
            }
        )
        b_dha.name = "DHA Bukhari Studio"
        b_dha.address = "42-C, Main Bukhari Commercial, Phase 6, DHA"
        b_dha.city = "Karachi"
        b_dha.currency = "PKR"
        b_dha.timezone = "Asia/Karachi"
        b_dha.save()

        # Update old branches if present
        Branch.objects.filter(code="DT-01").update(name="Clifton Flagship Branch", city="Karachi", currency="PKR", timezone="Asia/Karachi")
        Branch.objects.filter(code="UP-02").update(name="DHA Bukhari Studio", city="Karachi", currency="PKR", timezone="Asia/Karachi")

        # 3. Operating Hours (Monday through Sunday)
        for b in [b_clifton, b_dha]:
            for day in range(7):
                OperatingHours.objects.get_or_create(
                    branch=b,
                    weekday=day,
                    defaults={
                        "open_time": time(10, 0),
                        "close_time": time(21, 0),
                        "is_closed": False,
                    }
                )

        # 4. Demo Users for Shay Salon
        users_config = [
            {
                "email": "owner@shay.salon",
                "full_name": "Shayan Merchant (Owner & Founder)",
                "system_role": User.SystemRole.BUSINESS_OWNER,
                "roles": [],
            },
            {
                "email": "owner@luxeaura.salon",  # Backward compatibility
                "full_name": "Shayan Merchant (Owner)",
                "system_role": User.SystemRole.BUSINESS_OWNER,
                "roles": [],
            },
            {
                "email": "accountant@shay.salon",
                "full_name": "Farhan Siddiqui (Head of Accounts)",
                "system_role": User.SystemRole.STAFF,
                "roles": [
                    (b_clifton, UserBranchRole.Role.ACCOUNTANT),
                    (b_dha, UserBranchRole.Role.ACCOUNTANT),
                ],
            },
            {
                "email": "accountant@luxeaura.salon",
                "full_name": "Farhan Siddiqui (Accountant)",
                "system_role": User.SystemRole.STAFF,
                "roles": [
                    (b_clifton, UserBranchRole.Role.ACCOUNTANT),
                    (b_dha, UserBranchRole.Role.ACCOUNTANT),
                ],
            },
            {
                "email": "manager.clifton@shay.salon",
                "full_name": "Zainab Tariq (Clifton Manager)",
                "system_role": User.SystemRole.STAFF,
                "roles": [(b_clifton, UserBranchRole.Role.BRANCH_MANAGER)],
            },
            {
                "email": "manager.downtown@luxeaura.salon",
                "full_name": "Zainab Tariq (Clifton Manager)",
                "system_role": User.SystemRole.STAFF,
                "roles": [(b_clifton, UserBranchRole.Role.BRANCH_MANAGER)],
            },
            {
                "email": "manager.dha@shay.salon",
                "full_name": "Hamza Abbasi (DHA Manager)",
                "system_role": User.SystemRole.STAFF,
                "roles": [(b_dha, UserBranchRole.Role.BRANCH_MANAGER)],
            },
            {
                "email": "manager.uptown@luxeaura.salon",
                "full_name": "Hamza Abbasi (DHA Manager)",
                "system_role": User.SystemRole.STAFF,
                "roles": [(b_dha, UserBranchRole.Role.BRANCH_MANAGER)],
            },
            {
                "email": "reception.clifton@shay.salon",
                "full_name": "Ayesha Khan (Clifton Reception)",
                "system_role": User.SystemRole.STAFF,
                "roles": [(b_clifton, UserBranchRole.Role.RECEPTIONIST)],
            },
            {
                "email": "reception.downtown@luxeaura.salon",
                "full_name": "Ayesha Khan (Clifton Reception)",
                "system_role": User.SystemRole.STAFF,
                "roles": [(b_clifton, UserBranchRole.Role.RECEPTIONIST)],
            },
            {
                "email": "reception.dha@shay.salon",
                "full_name": "Hira Munir (DHA Reception)",
                "system_role": User.SystemRole.STAFF,
                "roles": [(b_dha, UserBranchRole.Role.RECEPTIONIST)],
            },
            {
                "email": "reception.uptown@luxeaura.salon",
                "full_name": "Hira Munir (DHA Reception)",
                "system_role": User.SystemRole.STAFF,
                "roles": [(b_dha, UserBranchRole.Role.RECEPTIONIST)],
            },
            {
                "email": "aliya.rizvi@shay.salon",
                "full_name": "Aliya Rizvi (Master Stylist)",
                "system_role": User.SystemRole.STAFF,
                "roles": [
                    (b_clifton, UserBranchRole.Role.STAFF_MEMBER),
                    (b_dha, UserBranchRole.Role.STAFF_MEMBER),
                ],
            },
            {
                "email": "elena.rostova@luxeaura.salon",
                "full_name": "Aliya Rizvi (Creative Director)",
                "system_role": User.SystemRole.STAFF,
                "roles": [
                    (b_clifton, UserBranchRole.Role.STAFF_MEMBER),
                    (b_dha, UserBranchRole.Role.STAFF_MEMBER),
                ],
            },
        ]

        password = "SalonPass123!"

        for udata in users_config:
            u, _ = User.objects.get_or_create(
                email=udata["email"],
                defaults={
                    "full_name": udata["full_name"],
                    "system_role": udata["system_role"],
                    "tenant": tenant,
                    "is_active": True,
                }
            )
            u.full_name = udata["full_name"]
            u.system_role = udata["system_role"]
            u.set_password(password)
            u.save()

            for branch, role in udata["roles"]:
                UserBranchRole.objects.get_or_create(
                    user=u,
                    branch=branch,
                    role=role,
                    defaults={"is_active": True}
                )

        # 5. Services in Pakistani Rupees (PKR)
        services_data = [
            {
                "name": "Signature Precision Haircut & Styling",
                "category": "Hair Services",
                "description": "Artisanal consultation, scalp detox wash with Kérastase, tailored precision haircut, and bouncy blowout finish.",
                "duration": 60,
                "price": Decimal("3500.00"),
            },
            {
                "name": "Full Balayage & Gloss Couture",
                "category": "Hair Color",
                "description": "Hand-painted dimensional balayage highlights with custom gloss toner, Olaplex bonding treatment, and styling.",
                "duration": 150,
                "price": Decimal("18500.00"),
            },
            {
                "name": "Hydra-Glow Luxury Facial",
                "category": "Esthetics & Skincare",
                "description": "Deep medical vacuum pore cleanse, ultrasound infusion, cold hammer lymphatic lift, and 24K gold collagen mask.",
                "duration": 75,
                "price": Decimal("9500.00"),
            },
            {
                "name": "Restorative Scalp Ritual & Hair Spa",
                "category": "Body Spa",
                "description": "Microscopic scalp camera diagnostic, exfoliating scrub, deep steam head massage, and aromatic botanical hair bath.",
                "duration": 60,
                "price": Decimal("5500.00"),
            },
            {
                "name": "Gel Couture Manicure & Pedicure Spa",
                "category": "Nail Care",
                "description": "Paraffin wax soak, dead skin exfoliation, cuticle therapy, therapeutic pressure point massage, and OPI gel polish.",
                "duration": 60,
                "price": Decimal("4500.00"),
            },
            {
                "name": "Keratin Silk Smooth Therapy",
                "category": "Hair Services",
                "description": "Formaldehyde-free Brazilian keratin infusion to eliminate frizz, seal cuticles, and provide 4+ months of glass hair shine.",
                "duration": 180,
                "price": Decimal("24000.00"),
            },
            {
                "name": "Classic Blowdry & Glamour Waves",
                "category": "Hair Services",
                "description": "Volumizing shampoo wash, thermal heat defense spray, and bouncy red-carpet Hollywood glamour waves.",
                "duration": 40,
                "price": Decimal("2500.00"),
            },
        ]

        created_services = []
        for sdata in services_data:
            s, _ = Service.objects.get_or_create(
                tenant=tenant,
                name=sdata["name"],
                defaults={
                    "category": sdata["category"],
                    "description": sdata["description"],
                    "default_duration_minutes": sdata["duration"],
                    "buffer_minutes": 15,
                    "base_price": sdata["price"],
                    "is_active": True,
                    "public_bookable": True,
                }
            )
            s.base_price = sdata["price"]
            s.description = sdata["description"]
            s.save()
            created_services.append(s)

        # 6. Staff Profiles (Karachi Master Artisans)
        staff_data = [
            {
                "code": "EMP-001",
                "name": "Aliya Rizvi",
                "email": "aliya.rizvi@shay.salon",
                "title": "Creative Director & Master Stylist",
                "bio": "14+ years mastering Toni&Guy precision cuts and seamless multi-tonal Parisian balayage.",
                "user_email": "aliya.rizvi@shay.salon",
                "branches": [b_clifton, b_dha],
                "services": [created_services[0], created_services[1], created_services[5]],
                "shifts": [0, 1, 2, 3, 4],  # Mon-Fri
            },
            {
                "code": "EMP-002",
                "name": "Tariq Mehmood",
                "email": "tariq.mehmood@shay.salon",
                "title": "Senior Hair Colorist & Balayage Specialist",
                "bio": "Expert in ash blonde transformations, brunette babylights, and Asian hair bleaching without damage.",
                "user_email": None,
                "branches": [b_clifton],
                "services": [created_services[0], created_services[1], created_services[6]],
                "shifts": [1, 2, 3, 4, 5],  # Tue-Sat
            },
            {
                "code": "EMP-003",
                "name": "Dr. Sana Hashmi",
                "email": "sana.hashmi@shay.salon",
                "title": "Lead Clinical Aesthetician & Skin Specialist",
                "bio": "Certified dermatological therapist specialized in Hydrafacial MD, dermaplaning, and barrier restoration.",
                "user_email": None,
                "branches": [b_clifton, b_dha],
                "services": [created_services[2], created_services[3]],
                "shifts": [0, 2, 3, 4, 5],
            },
            {
                "code": "EMP-004",
                "name": "Bilal Qureshi",
                "email": "bilal.qureshi@shay.salon",
                "title": "Senior Stylist & Barbering Artist",
                "bio": "Renowned for modern textured crops, beard sculpting, and customized bouncy blowouts.",
                "user_email": None,
                "branches": [b_dha],
                "services": [created_services[0], created_services[6]],
                "shifts": [0, 1, 3, 4, 5],
            },
            {
                "code": "EMP-005",
                "name": "Mehak Fatima",
                "email": "mehak.fatima@shay.salon",
                "title": "Senior Nail Artist & Spa Reflexologist",
                "bio": "Expert in Russian dry manicure, BIAB builder gel overlays, and foot reflexology massage.",
                "user_email": None,
                "branches": [b_clifton, b_dha],
                "services": [created_services[4]],
                "shifts": [1, 2, 3, 4, 6],
            },
        ]

        created_staff = []
        for s_info in staff_data:
            user_inst = User.objects.filter(email=s_info["user_email"]).first() if s_info["user_email"] else None
            sp, _ = StaffProfile.objects.get_or_create(
                tenant=tenant,
                employee_code=s_info["code"],
                defaults={
                    "full_name": s_info["name"],
                    "email": s_info["email"],
                    "title": s_info["title"],
                    "bio": s_info["bio"],
                    "user": user_inst,
                    "biometric_user_id": s_info["code"].replace("EMP-", "BIO-"),
                    "is_active": True,
                }
            )
            sp.full_name = s_info["name"]
            sp.title = s_info["title"]
            sp.bio = s_info["bio"]
            sp.save()
            created_staff.append(sp)

            # Assign branches & shifts
            for b in s_info["branches"]:
                StaffBranchAssignment.objects.get_or_create(
                    staff=sp,
                    branch=b,
                    defaults={"is_primary": (b == s_info["branches"][0]), "is_active": True}
                )

                for day in s_info["shifts"]:
                    StaffShift.objects.get_or_create(
                        branch=b,
                        staff=sp,
                        weekday=day,
                        defaults={
                            "start_time": time(10, 0),
                            "end_time": time(19, 0),
                            "break_start": time(14, 0),
                            "break_end": time(15, 0),
                            "is_active": True,
                        }
                    )

            for s_qual in s_info["services"]:
                StaffService.objects.get_or_create(
                    staff=sp,
                    service=s_qual,
                    defaults={"is_active": True}
                )

        # 7. Products & Inventory (PKR)
        products_data = [
            ("Kérastase Nutritive Bain Satin Shampoo 250ml", "SKU-KS-01", Product.Category.RETAIL, Decimal("5500.00"), Decimal("8500.00")),
            ("Olaplex No. 3 Hair Perfector 100ml", "SKU-OP-01", Product.Category.RETAIL, Decimal("6000.00"), Decimal("9200.00")),
            ("Moroccanoil Treatment Original 100ml", "SKU-MO-01", Product.Category.RETAIL, Decimal("7000.00"), Decimal("10500.00")),
            ("Dermalogica Daily Microfoliant 74g", "SKU-DM-01", Product.Category.RETAIL, Decimal("8000.00"), Decimal("12000.00")),
            ("Kérastase Chronologiste Essential Mask 200ml", "SKU-KS-02", Product.Category.CONSUMABLE, Decimal("9000.00"), Decimal("14500.00")),
            ("Wella Blondor Multi-Blonde Bleach Powder 800g", "SKU-WL-01", Product.Category.CONSUMABLE, Decimal("11000.00"), Decimal("16000.00")),
        ]

        for p_name, sku, cat, cost, sell in products_data:
            p, _ = Product.objects.get_or_create(
                tenant=tenant,
                sku=sku,
                defaults={
                    "name": p_name,
                    "category": cat,
                    "cost_price": cost,
                    "selling_price": sell,
                    "reorder_level": Decimal("10.00"),
                    "is_active": True,
                }
            )
            p.cost_price = cost
            p.selling_price = sell
            p.save()

            for b in [b_clifton, b_dha]:
                BranchInventory.objects.get_or_create(
                    branch=b,
                    product=p,
                    defaults={"quantity_on_hand": Decimal("30.00")}
                )

        # 8. Biometric Devices in Karachi
        BiometricDevice.objects.get_or_create(
            serial_number="ZK-BIO-CLIF01",
            defaults={
                "tenant": tenant,
                "branch": b_clifton,
                "name": "Clifton Reception Biometric Clock",
                "device_model": "ZKTeco SilkBio-101TC",
                "status": BiometricDevice.Status.ONLINE,
                "last_sync_at": timezone.now(),
            }
        )

        BiometricDevice.objects.get_or_create(
            serial_number="ZK-BIO-DHA02",
            defaults={
                "tenant": tenant,
                "branch": b_dha,
                "name": "DHA Studio Staff Entrance Clock",
                "device_model": "ZKTeco SilkBio-101TC",
                "status": BiometricDevice.Status.ONLINE,
                "last_sync_at": timezone.now(),
            }
        )

        # 9. Customers & Appointments in Karachi
        cust_mahnoor, _ = Customer.objects.get_or_create(
            tenant=tenant,
            phone="+923002415981",
            defaults={
                "full_name": "Mahnoor Baloch",
                "email": "mahnoor.baloch@gmail.com",
                "whatsapp_opt_in": True,
            }
        )

        cust_zara, _ = Customer.objects.get_or_create(
            tenant=tenant,
            phone="+923218745123",
            defaults={
                "full_name": "Zara Sheikh",
                "email": "zara.sheikh@hotmail.com",
                "whatsapp_opt_in": True,
            }
        )

        cust_danyal, _ = Customer.objects.get_or_create(
            tenant=tenant,
            phone="+923339128475",
            defaults={
                "full_name": "Danyal Mirza",
                "email": "danyal.mirza@gmail.com",
                "whatsapp_opt_in": True,
            }
        )

        aliya = created_staff[0]
        tariq = created_staff[1]
        sana = created_staff[2]
        bilal = created_staff[3]

        today = timezone.localdate()
        today_11am = timezone.make_aware(datetime.combine(today, time(11, 0)))
        today_12pm = today_11am + timedelta(minutes=60)

        today_14pm = timezone.make_aware(datetime.combine(today, time(14, 0)))
        today_16pm = today_14pm + timedelta(minutes=150)

        today_1630pm = timezone.make_aware(datetime.combine(today, time(16, 30)))
        today_1730pm = today_1630pm + timedelta(minutes=60)

        # Appointment 1 (Mahnoor at Clifton)
        appt1, _ = Appointment.objects.get_or_create(
            booking_reference="BK-SHAY-001",
            defaults={
                "tenant": tenant,
                "branch": b_clifton,
                "customer": cust_mahnoor,
                "primary_staff": aliya,
                "source": Appointment.Source.WEBSITE,
                "status": Appointment.Status.CONFIRMED,
                "start_time": today_11am,
                "end_time": today_12pm,
                "buffer_minutes": 15,
                "total_duration_minutes": 60,
                "subtotal_amount": Decimal("3500.00"),
                "tax_amount": Decimal("455.00"),
                "total_amount": Decimal("3955.00"),
                "notes": "Prefers warm green tea with cardamom.",
            }
        )
        AppointmentItem.objects.get_or_create(
            appointment=appt1,
            service=created_services[0],
            defaults={
                "staff": aliya,
                "service_name_snapshot": created_services[0].name,
                "duration_minutes": 60,
                "price": Decimal("3500.00"),
                "sequence_order": 1,
            }
        )

        # Appointment 2 (Zara at Clifton - In Progress)
        appt2, _ = Appointment.objects.get_or_create(
            booking_reference="BK-SHAY-002",
            defaults={
                "tenant": tenant,
                "branch": b_clifton,
                "customer": cust_zara,
                "primary_staff": tariq,
                "source": Appointment.Source.WHATSAPP,
                "status": Appointment.Status.IN_PROGRESS,
                "start_time": today_14pm,
                "end_time": today_16pm,
                "buffer_minutes": 15,
                "total_duration_minutes": 150,
                "subtotal_amount": Decimal("18500.00"),
                "tax_amount": Decimal("2405.00"),
                "total_amount": Decimal("20905.00"),
                "notes": "Warm honey caramel tone with face-framing money piece.",
            }
        )
        AppointmentItem.objects.get_or_create(
            appointment=appt2,
            service=created_services[1],
            defaults={
                "staff": tariq,
                "service_name_snapshot": created_services[1].name,
                "duration_minutes": 150,
                "price": Decimal("18500.00"),
                "sequence_order": 1,
            }
        )

        # Appointment 3 (Danyal at DHA - Completed)
        reception_clif = User.objects.filter(email="reception.clifton@shay.salon").first() or User.objects.first()
        appt3, _ = Appointment.objects.get_or_create(
            booking_reference="BK-SHAY-003",
            defaults={
                "tenant": tenant,
                "branch": b_dha,
                "customer": cust_danyal,
                "primary_staff": bilal,
                "source": Appointment.Source.WALK_IN,
                "status": Appointment.Status.COMPLETED,
                "start_time": today_1630pm,
                "end_time": today_1730pm,
                "buffer_minutes": 15,
                "total_duration_minutes": 60,
                "subtotal_amount": Decimal("3500.00"),
                "tax_amount": Decimal("455.00"),
                "total_amount": Decimal("3955.00"),
                "notes": "Texture fade and beard sculpting.",
            }
        )
        AppointmentItem.objects.get_or_create(
            appointment=appt3,
            service=created_services[0],
            defaults={
                "staff": bilal,
                "service_name_snapshot": created_services[0].name,
                "duration_minutes": 60,
                "price": Decimal("3500.00"),
                "sequence_order": 1,
            }
        )

        # Invoice for appt3
        inv, _ = Invoice.objects.get_or_create(
            appointment=appt3,
            defaults={
                "tenant": tenant,
                "branch": b_dha,
                "customer": cust_danyal,
                "invoice_number": "INV-SHAY-0101",
                "status": Invoice.Status.PAID,
                "subtotal": Decimal("3500.00"),
                "tax_amount": Decimal("455.00"),
                "total_amount": Decimal("3955.00"),
                "amount_paid": Decimal("3955.00"),
                "issued_by": reception_clif,
            }
        )
        Payment.objects.get_or_create(
            invoice=inv,
            defaults={
                "branch": b_dha,
                "method": Payment.Method.CARD,
                "amount": Decimal("3955.00"),
                "reference_code": "TXN-HBL-8812",
                "received_by": reception_clif,
            }
        )

        # 10. Staff Salaries & Payroll in PKR
        owner_user = User.objects.filter(email="owner@shay.salon").first() or User.objects.first()

        salary_configs = [
            (aliya, Decimal("125000.00"), Decimal("800.00")),
            (tariq, Decimal("100000.00"), Decimal("650.00")),
            (sana, Decimal("135000.00"), Decimal("850.00")),
            (bilal, Decimal("85000.00"), Decimal("550.00")),
        ]
        for sp_inst, base_sal, hr_rate in salary_configs:
            if sp_inst:
                SalaryRule.objects.get_or_create(
                    staff=sp_inst,
                    defaults={
                        "base_monthly_salary": base_sal,
                        "hourly_rate": hr_rate,
                        "overtime_multiplier": Decimal("1.50"),
                        "late_deduction_per_minute": Decimal("10.00"),
                    }
                )

        # Attendance Summaries for current month
        month_start = today.replace(day=1)
        for i in range(1, min(today.day + 1, 21)):
            wdate = today.replace(day=i)
            AttendanceSummary.objects.get_or_create(
                branch=b_clifton,
                staff=aliya,
                work_date=wdate,
                defaults={
                    "first_check_in": timezone.make_aware(datetime.combine(wdate, time(9, 55))),
                    "last_check_out": timezone.make_aware(datetime.combine(wdate, time(19, 10))),
                    "worked_minutes": 555,
                    "status": AttendanceSummary.Status.PRESENT,
                }
            )
            if tariq:
                AttendanceSummary.objects.get_or_create(
                    branch=b_clifton,
                    staff=tariq,
                    work_date=wdate,
                    defaults={
                        "first_check_in": timezone.make_aware(datetime.combine(wdate, time(10, 10))),
                        "last_check_out": timezone.make_aware(datetime.combine(wdate, time(19, 0))),
                        "worked_minutes": 530,
                        "status": AttendanceSummary.Status.PRESENT,
                    }
                )

        # 11. Karachi Payroll Runs (Clifton & DHA)
        first_day_of_month = today.replace(day=1)
        last_day_of_month = (today.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)

        # Clifton Payroll Run
        pr_clif, _ = PayrollRun.objects.get_or_create(
            tenant=tenant,
            branch=b_clifton,
            period_start=first_day_of_month,
            period_end=last_day_of_month,
            defaults={
                "status": PayrollRun.Status.DRAFT,
                "total_gross": Decimal("235000.00"),
                "total_commissions": Decimal("15000.00"),
                "total_deductions": Decimal("5000.00"),
                "total_net": Decimal("245000.00"),
                "processed_by": owner_user,
            }
        )

        PayrollItem.objects.get_or_create(
            payroll_run=pr_clif,
            staff=aliya,
            defaults={
                "base_pay": Decimal("125000.00"),
                "commission_pay": Decimal("15000.00"),
                "overtime_pay": Decimal("9600.00"),
                "overtime_hours": Decimal("8.00"),
                "bonuses": Decimal("5000.00"),
                "deductions": Decimal("0.00"),
                "late_deduction_hours": Decimal("0.00"),
                "net_pay": Decimal("154600.00"),
                "amount_paid": Decimal("154600.00"),
                "payment_status": "PAID",
                "days_worked": 21,
                "notes": "Verified by Clifton time terminal: 8h overtime @ 1.5x (Rs. 1,200/hr). Disbursed in full via Meezan Bank wire.",
            }
        )

        if tariq:
            PayrollItem.objects.get_or_create(
                payroll_run=pr_clif,
                staff=tariq,
                defaults={
                    "base_pay": Decimal("100000.00"),
                    "commission_pay": Decimal("8000.00"),
                    "overtime_pay": Decimal("0.00"),
                    "overtime_hours": Decimal("0.00"),
                    "bonuses": Decimal("0.00"),
                    "deductions": Decimal("5000.00"),
                    "late_deduction_hours": Decimal("8.00"),
                    "net_pay": Decimal("103000.00"),
                    "amount_paid": Decimal("80000.00"),
                    "payment_status": "PARTIAL",
                    "days_worked": 19,
                    "notes": "Rs. 23,000 remaining balance pending final tax deduction audit.",
                }
            )

        self.stdout.write(self.style.SUCCESS("Shay Salon (Karachi, Pakistan) demo dataset successfully seeded!"))
