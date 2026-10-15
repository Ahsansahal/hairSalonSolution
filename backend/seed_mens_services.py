import os
import sys
from decimal import Decimal
import django

# Set up Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Tenant, Branch, Service, BranchService, StaffProfile, StaffService

def seed_services():
    tenants = Tenant.objects.all()
    if not tenants.exists():
        print("No tenants found!")
        return

    branches = Branch.objects.all()
    staff_members = StaffProfile.objects.all()

    # Complete Men's Single Services based on Lavish Salon Karachi
    single_services = [
        # 1. Haircut & Styling
        {
            "name": "Classic Precision Haircut & Wash",
            "category": "Haircut & Styling",
            "description": "Face-shape consultation, classic scissor and clipper haircut, relaxing Kérastase hair wash, and blow-dry style finish.",
            "duration": 35,
            "price": Decimal("1500.00"),
        },
        {
            "name": "Skin Fade / Taper Fade Cut",
            "category": "Haircut & Styling",
            "description": "Ultra-sharp razor skin fade, low/mid/high taper, neckline detailing, and textured matte clay styling.",
            "duration": 45,
            "price": Decimal("1800.00"),
        },
        {
            "name": "Scissor Work & Texture Cut",
            "category": "Haircut & Styling",
            "description": "Master scissor-over-comb texturizing, volume balancing for natural movement, and home styling guidance.",
            "duration": 45,
            "price": Decimal("2200.00"),
        },
        {
            "name": "Expert Master Hair Styling & Blow-Dry",
            "category": "Haircut & Styling",
            "description": "Pre-styling tonic, volume round-brush blow-dry, and professional hair wax/clay hold for events.",
            "duration": 25,
            "price": Decimal("1000.00"),
        },
        {
            "name": "Kids / Junior Haircut & Styling",
            "category": "Haircut & Styling",
            "description": "Patient, gentle scissor and clipper haircut for young gentlemen (under 12) with light gel styling.",
            "duration": 30,
            "price": Decimal("1200.00"),
        },

        # 2. Beard Styling & Shave
        {
            "name": "Beard Trimming & Length Control",
            "category": "Beard Styling & Shave",
            "description": "Clipper guard length trimming, neckline cleanup, mustache trim, and nourishing beard balm application.",
            "duration": 20,
            "price": Decimal("800.00"),
        },
        {
            "name": "Beard Shaping & Razor Line-Up",
            "category": "Beard Styling & Shave",
            "description": "Precision straight-razor cheek line, neck fade contouring, mustache detailing, and soothing aftershave.",
            "duration": 25,
            "price": Decimal("1200.00"),
        },
        {
            "name": "Expert Beard Sculpting & Oil Massage",
            "category": "Beard Styling & Shave",
            "description": "Scissor shaping for density, hot herbal towel wrap, and deep argan beard conditioning oil massage.",
            "duration": 35,
            "price": Decimal("1600.00"),
        },
        {
            "name": "Luxury Hot Towel Shave",
            "category": "Beard Styling & Shave",
            "description": "Steamed aromatic hot towels, rich badger-hair lather, Japanese straight-razor shave, and cold stone pore closure.",
            "duration": 30,
            "price": Decimal("1400.00"),
        },
        {
            "name": "Beard Color / Dye & Camouflage",
            "category": "Beard Styling & Shave",
            "description": "Natural grey blending dye formulated specifically for facial hair to avoid skin pigmentation.",
            "duration": 25,
            "price": Decimal("1200.00"),
        },

        # 3. Hair Color & Grey Blending
        {
            "name": "Natural Grey Blending (Men)",
            "category": "Hair Color & Chemical",
            "description": "Subtle 5-minute translucent grey blending for a salt-and-pepper, natural youthful look without regrowth lines.",
            "duration": 35,
            "price": Decimal("2500.00"),
        },
        {
            "name": "Full Hair Color (Ammonia-Free)",
            "category": "Hair Color & Chemical",
            "description": "L'Oreal Inoa 100% ammonia-free dark brown or black shade application with scalp barrier protection.",
            "duration": 50,
            "price": Decimal("3500.00"),
        },
        {
            "name": "Beard & Moustache Color",
            "category": "Hair Color & Chemical",
            "description": "Even shade restoration and grey coverage for beard and moustache.",
            "duration": 25,
            "price": Decimal("1500.00"),
        },
        {
            "name": "Fashion Highlights / Streaking",
            "category": "Hair Color & Chemical",
            "description": "Hand-placed foil highlights in caramel, ash-blonde, or silver tips with Olaplex bond builder.",
            "duration": 60,
            "price": Decimal("4500.00"),
        },

        # 4. Facial & Skin Care
        {
            "name": "Signature HydraFacial Deep Cleanse",
            "category": "Facial & Skin Care",
            "description": "Medical vortex vacuum pore extraction, salicylic peel, ultrasound serum infusion, and LED phototherapy.",
            "duration": 60,
            "price": Decimal("6500.00"),
        },
        {
            "name": "Charcoal Detox Clean-Up & Blackhead Extraction",
            "category": "Facial & Skin Care",
            "description": "Herbal facial steam, nose blackhead vacuuming, activated charcoal scrub, and tightening tea-tree mask.",
            "duration": 40,
            "price": Decimal("3000.00"),
        },
        {
            "name": "Whitening & Brightening Facial",
            "category": "Facial & Skin Care",
            "description": "Derma-glow fruit enzyme polish, vitamin-C ampoule massage, and brightening alginate mask.",
            "duration": 45,
            "price": Decimal("3500.00"),
        },
        {
            "name": "Anti-Acne & Oil-Control Treatment",
            "category": "Facial & Skin Care",
            "description": "Targeted clinical treatment for oily skin, high-frequency wand sterilization, and cooling green tea compress.",
            "duration": 50,
            "price": Decimal("4000.00"),
        },

        # 5. Hair & Scalp Treatments
        {
            "name": "Brazilian Keratin Smoothing Therapy",
            "category": "Hair & Scalp Treatments",
            "description": "Formaldehyde-free organic keratin infusion to eliminate unruly curls, frizz, and humidity puffiness for 3+ months.",
            "duration": 120,
            "price": Decimal("12000.00"),
        },
        {
            "name": "Hair Botox & Protein Reconstruction",
            "category": "Hair & Scalp Treatments",
            "description": "Deep cellular rebuilding for heat/color-damaged hair with hyaluronic acid, collagen, and caviar extract.",
            "duration": 90,
            "price": Decimal("8500.00"),
        },
        {
            "name": "Anti-Dandruff Scalp Clarifying Ritual",
            "category": "Hair & Scalp Treatments",
            "description": "Exfoliating salicylic scalp scrub, anti-fungal zinc therapy, steam infusion, and cooling menthol tonic.",
            "duration": 45,
            "price": Decimal("3200.00"),
        },
        {
            "name": "Hot Oil Head & Shoulder Massage",
            "category": "Hair & Scalp Treatments",
            "description": "Warm organic almond, coconut and rosemary oil blend with acupressure stress-relief shoulder massage.",
            "duration": 30,
            "price": Decimal("1800.00"),
        },

        # 6. Mani-Pedi & Express Grooming
        {
            "name": "Executive Men's Manicure",
            "category": "Mani-Pedi & Spa",
            "description": "Nail trimming, shaping, cuticle clean-up, walnut hand scrub, and relaxing hand pressure massage.",
            "duration": 35,
            "price": Decimal("2000.00"),
        },
        {
            "name": "Therapeutic Foot Spa Pedicure",
            "category": "Mani-Pedi & Spa",
            "description": "Epsom salt foot soak, pumice callous removal, peppermint scrub, and revitalizing calf massage.",
            "duration": 40,
            "price": Decimal("2500.00"),
        },
    ]

    for tenant in tenants:
        print(f"Seeding services for tenant: {tenant.name} ({tenant.id})")
        for s_data in single_services:
            service, created = Service.objects.update_or_create(
                tenant=tenant,
                name=s_data["name"],
                defaults={
                    "category": s_data["category"],
                    "description": s_data["description"],
                    "default_duration_minutes": s_data["duration"],
                    "base_price": s_data["price"],
                    "buffer_minutes": 10,
                    "is_active": True,
                    "public_bookable": True,
                }
            )
            action = "Created" if created else "Updated"
            print(f"  [{action}] {service.name} - Rs. {service.base_price}")

            # Assign to all tenant branches
            tenant_branches = branches.filter(tenant=tenant)
            for branch in tenant_branches:
                BranchService.objects.get_or_create(
                    branch=branch,
                    service=service,
                    defaults={
                        "is_available": True,
                        "price": service.base_price,
                        "duration_minutes": service.default_duration_minutes,
                    }
                )

            # Assign qualification to staff members of this tenant
            tenant_staff = staff_members.filter(user__tenant=tenant)
            for staff in tenant_staff:
                StaffService.objects.get_or_create(
                    staff=staff,
                    service=service,
                    defaults={"is_active": True}
                )

    print("Successfully seeded all Men's Single Services across branches and staff!")

if __name__ == "__main__":
    seed_services()
