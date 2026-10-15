import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from decimal import Decimal
from core.models import Tenant, Branch, Service, BranchService

tenant = Tenant.objects.first()
if not tenant:
    print("No tenant found!")
    exit(1)

branches = list(Branch.objects.filter(tenant=tenant))

LAVISH_CATALOG = [
  # Single Services: Haircut & Styling
  {
    "name": "Signature Precision Haircut & Styling",
    "category": "Haircut & Styling",
    "base_price": Decimal("2500.00"),
    "default_duration_minutes": 45,
    "description": "Face-shape consultation, classic and modern cuts, scissor work, skin fades, tapers, texture, hair wash and professional finishing.",
  },
  {
    "name": "Classic Scissor Cut & Blow-Dry",
    "category": "Haircut & Styling",
    "base_price": Decimal("2200.00"),
    "default_duration_minutes": 40,
    "description": "Traditional scissor cut based on natural growth pattern, weight removal, shampoo wash and styled blow-dry finish.",
  },
  {
    "name": "Executive Hair Styling & Blow-Dry Finish",
    "category": "Haircut & Styling",
    "base_price": Decimal("1800.00"),
    "default_duration_minutes": 30,
    "description": "Volumizing wash, heat-protected blow-dry, matte clay or pomade hold, and camera-ready styling.",
  },
  {
    "name": "Expert Master Stylist Haircut & Consultation",
    "category": "Haircut & Styling",
    "base_price": Decimal("3500.00"),
    "default_duration_minutes": 50,
    "description": "Senior art director consultation, bespoke hair architecture, scalp detox rinse, and tailored styling advice.",
  },
  {
    "name": "Junior / Kids Grooming Haircut",
    "category": "Haircut & Styling",
    "base_price": Decimal("1500.00"),
    "default_duration_minutes": 30,
    "description": "Comfortable and patient kids haircut tailored to easy daily maintenance and gentle scalp rinse.",
  },
  {
    "name": "Deep Scalp Cleanse & Conditioning Rinse",
    "category": "Haircut & Styling",
    "base_price": Decimal("800.00"),
    "default_duration_minutes": 20,
    "description": "Invigorating tea tree and peppermint shampoo, stimulating scalp pressure point wash, and smoothing conditioner.",
  },

  # Single Services: Beard Styling & Shave
  {
    "name": "Beard Trimming & Length Control",
    "category": "Beard Styling & Shave",
    "base_price": Decimal("800.00"),
    "default_duration_minutes": 25,
    "description": "Clipper fade, symmetry alignment, length control, and neat moustache trimming with scissors.",
  },
  {
    "name": "Beard Shaping & Razor Line-Up",
    "category": "Beard Styling & Shave",
    "base_price": Decimal("1200.00"),
    "default_duration_minutes": 30,
    "description": "Sharp razor cheek and neckline definition, sideburn blending, and cooling aloe vera aftershave.",
  },
  {
    "name": "Royal Hot Towel Straight-Razor Shave",
    "category": "Beard Styling & Shave",
    "base_price": Decimal("1400.00"),
    "default_duration_minutes": 35,
    "description": "Pre-shave eucalyptus oil, double hot towel steam wrap, rich lather shave with a fresh blade, and cold towel close.",
  },
  {
    "name": "Expert Beard Sculpting & Oil Massage",
    "category": "Beard Styling & Shave",
    "base_price": Decimal("1600.00"),
    "default_duration_minutes": 35,
    "description": "Detailed shape sculpting, hot steam infusion, warm organic argan beard oil massage, and styling balm.",
  },
  {
    "name": "Natural-Shade Beard Dye & Camouflage",
    "category": "Beard Styling & Shave",
    "base_price": Decimal("1800.00"),
    "default_duration_minutes": 30,
    "description": "Gentle ammonia-free grey blending in natural black or brown shades, skin-safe application, and deep beard wash.",
  },
  {
    "name": "Moustache Detailing & Contour",
    "category": "Beard Styling & Shave",
    "base_price": Decimal("600.00"),
    "default_duration_minutes": 15,
    "description": "Precision scissor detailing, lip line cleanup, and wax shaping for handlebar or classic moustache.",
  },

  # Single Services: Hair Color & Chemical Work
  {
    "name": "Men's Head Hair Color & Grey Blending",
    "category": "Hair Color & Chemical Work",
    "base_price": Decimal("3800.00"),
    "default_duration_minutes": 60,
    "description": "Shade consultation for seamless natural grey coverage or full color change with scalp protective barrier.",
  },
  {
    "name": "Men's Fashion Colour & Foil Highlights",
    "category": "Hair Color & Chemical Work",
    "base_price": Decimal("6500.00"),
    "default_duration_minutes": 90,
    "description": "Ash blonde, platinum streaks, or caramel highlights with bond-protecting plex treatment and gloss toner.",
  },
  {
    "name": "Men's Perming & Textured Curls",
    "category": "Hair Color & Chemical Work",
    "base_price": Decimal("8500.00"),
    "default_duration_minutes": 120,
    "description": "Korean wavy perm or textured curls for volume, body and effortless day-to-day messy styling.",
  },
  {
    "name": "Keratin Smoothing & Anti-Frizz Treatment",
    "category": "Hair Color & Chemical Work",
    "base_price": Decimal("14000.00"),
    "default_duration_minutes": 150,
    "description": "Formaldehyde-free pure silk keratin infusion, eliminates frizz, locks in shine, lasts 3 to 5 months.",
  },
  {
    "name": "Hair Rebonding / Permanent Straightening",
    "category": "Hair Color & Chemical Work",
    "base_price": Decimal("16000.00"),
    "default_duration_minutes": 180,
    "description": "Permanent structural straightening for unruly coarse hair with neutralizing gloss and thermal seal.",
  },
  {
    "name": "Deep Hair Protein & Follicle Repair",
    "category": "Hair Color & Chemical Work",
    "base_price": Decimal("4800.00"),
    "default_duration_minutes": 60,
    "description": "Hydrolyzed wheat and keratin protein mask under thermal steam cap to restore dry, porous, or heat-damaged hair.",
  },
  {
    "name": "Restorative Scalp Ritual & Hair Spa Mask",
    "category": "Hair Color & Chemical Work",
    "base_price": Decimal("4200.00"),
    "default_duration_minutes": 50,
    "description": "Dead sea salt scalp scrub, essential botanical oils, relaxing 20-minute head massage, and nourishing cream bath.",
  },

  # Single Services: Facial & Skin Care
  {
    "name": "HydraFacial 7-Step Deep Pore Hydration",
    "category": "Facial & Skin Care",
    "base_price": Decimal("8500.00"),
    "default_duration_minutes": 60,
    "description": "Vortex vacuum extraction of blackheads, glycolic acid peeling, ultrasonic serum infusion, and cold hammer firming.",
  },
  {
    "name": "Jessica Whitening & Radiance Facial",
    "category": "Facial & Skin Care",
    "base_price": Decimal("5200.00"),
    "default_duration_minutes": 60,
    "description": "Jessica professional skincare whitening scrub, deep pore cleansing, brightening fruit pack, and glowing skin finish.",
  },
  {
    "name": "Dermacose Herbal / Acne Purifying Facial",
    "category": "Facial & Skin Care",
    "base_price": Decimal("5800.00"),
    "default_duration_minutes": 60,
    "description": "Targeted treatment for oily and acne-prone skin: tea tree cleanse, sebum balancing, high-frequency ozone therapy.",
  },
  {
    "name": "Beauté French Anti-Pollution Cleanse",
    "category": "Facial & Skin Care",
    "base_price": Decimal("4500.00"),
    "default_duration_minutes": 45,
    "description": "Surface cleansing, botanical scrub, and antioxidant hydration to reverse urban smoke, dust, and sun tan.",
  },
  {
    "name": "Deep Pore Cleansing & Blackhead Extraction",
    "category": "Facial & Skin Care",
    "base_price": Decimal("2500.00"),
    "default_duration_minutes": 35,
    "description": "Warm herbal steam, ultrasonic skin scrubber pore clearing, nose blackhead extraction, and pore-minimizing toner.",
  },
  {
    "name": "HydraFacial with Guinot French Serum & LED",
    "category": "Facial & Skin Care",
    "base_price": Decimal("12500.00"),
    "default_duration_minutes": 75,
    "description": "Clinical Hydra machine suction + Guinot cellular youth concentrate + 7-wavelength LED photo-rejuvenation light.",
  },
  {
    "name": "The Body Shop Organic Vitamin E Facial",
    "category": "Facial & Skin Care",
    "base_price": Decimal("7200.00"),
    "default_duration_minutes": 60,
    "description": "Wheatgerm oil and Vitamin E enriched moisture surge, soothing facial massage, and moisture barrier lock.",
  },
  {
    "name": "Active Charcoal Deep Detox Facial",
    "category": "Facial & Skin Care",
    "base_price": Decimal("3800.00"),
    "default_duration_minutes": 45,
    "description": "Activated bamboo charcoal clay mask, draws out trapped impurities, eliminates excess sebum, leaves skin clean and matte.",
  },

  # Single Services: Groom & Event Services
  {
    "name": "Deluxe Spa Herbal Manicure & Pedicure",
    "category": "Groom & Event Services",
    "base_price": Decimal("3500.00"),
    "default_duration_minutes": 60,
    "description": "Warm mineral salt soak, cuticle cleanup, heel calluses buffing, apricot walnut scrub, and relaxing hand & foot massage.",
  },
  {
    "name": "Event Groom Dressing & Styling",
    "category": "Groom & Event Services",
    "base_price": Decimal("5000.00"),
    "default_duration_minutes": 45,
    "description": "Turban tying, sherwani alignment, pocket square placement, light matte camera touch-up, and perfume mist.",
  },

  # 30 Men's Deals (Deals 01 to 30)
  {
    "name": "Men's Deal 01: Haircut & Stylish Beard",
    "category": "30 Men's Deals",
    "base_price": Decimal("3500.00"),
    "default_duration_minutes": 60,
    "description": "Professional Precision Haircut + Stylish Beard Trim & Shaping + Scalp Cleanse + Hot Towel Refreshment. (Valued at Rs. 5,000 · Save 30%)",
  },
  {
    "name": "Men's Deal 02: Jessica Whitening Facial & Haircut",
    "category": "30 Men's Deals",
    "base_price": Decimal("6200.00"),
    "default_duration_minutes": 75,
    "description": "Jessica Whitening Facial + Precision Haircut + Scalp Wash + Refreshing Mint Towel. (Valued at Rs. 8,500 · Save 27%)",
  },
  {
    "name": "Men's Deal 03: Styling Beard & Dermacose Facial",
    "category": "30 Men's Deals",
    "base_price": Decimal("6500.00"),
    "default_duration_minutes": 75,
    "description": "Dermacose Herbal Facial + Expert Beard Trim & Razor Lineup + Steam Therapy. (Valued at Rs. 9,000 · Save 28%)",
  },
  {
    "name": "Men's Deal 04: Beard Dye & Head Color Combo",
    "category": "30 Men's Deals",
    "base_price": Decimal("5800.00"),
    "default_duration_minutes": 60,
    "description": "Natural Shade Beard Dye + Head Hair Color / Grey Blending + Conditioning Wash. (Valued at Rs. 8,000 · Save 28%)",
  },
  {
    "name": "Men's Deal 05: Jessica Facial Package & Grooming",
    "category": "30 Men's Deals",
    "base_price": Decimal("6900.00"),
    "default_duration_minutes": 90,
    "description": "Jessica Cleansing Facial + Haircut + Beard Sculpting + Scalp Wash. (Valued at Rs. 9,500 · Save 27%)",
  },
  {
    "name": "Men's Deal 06: Hair Protein & Nourishing Hair Spa",
    "category": "30 Men's Deals",
    "base_price": Decimal("5500.00"),
    "default_duration_minutes": 60,
    "description": "Intense Protein Repair Mask + Hot Towel Hair Spa + Scalp Massage + Wash & Blow-dry. (Valued at Rs. 7,500 · Save 27%)",
  },
  {
    "name": "Men's Deal 07: Deluxe Spa Facial & Reflexology",
    "category": "30 Men's Deals",
    "base_price": Decimal("5800.00"),
    "default_duration_minutes": 60,
    "description": "Deep Spa Facial + Neck & Shoulder Tension Release Massage + Face Scrub. (Valued at Rs. 8,000 · Save 28%)",
  },
  {
    "name": "Men's Deal 08: Hair Protein, Haircut & Styling",
    "category": "30 Men's Deals",
    "base_price": Decimal("6500.00"),
    "default_duration_minutes": 75,
    "description": "Deep Hair Protein Mask + Precision Haircut + Matte Styling + Hair Rinse. (Valued at Rs. 9,000 · Save 28%)",
  },
  {
    "name": "Men's Deal 09: Beard & Facial Combo",
    "category": "30 Men's Deals",
    "base_price": Decimal("5200.00"),
    "default_duration_minutes": 60,
    "description": "Beard Sculpting & Lineup + Cleansing Glow Facial + Mint Towel. (Valued at Rs. 7,500 · Save 31%)",
  },
  {
    "name": "Men's Deal 10: Stylish Beard & Deep Pore Facial",
    "category": "30 Men's Deals",
    "base_price": Decimal("5900.00"),
    "default_duration_minutes": 70,
    "description": "Stylish Beard Trim + Deep Pore Facial + Blackhead Removal Scrub. (Valued at Rs. 8,200 · Save 28%)",
  },
  {
    "name": "Men's Deal 11: Acne Purifying Facial Package",
    "category": "30 Men's Deals",
    "base_price": Decimal("7200.00"),
    "default_duration_minutes": 75,
    "description": "Anti-Bacterial Acne Facial + High-Frequency Therapy + Precision Haircut. (Valued at Rs. 10,000 · Save 28%)",
  },
  {
    "name": "Men's Deal 12: Executive Haircut, Shave & Mani-Pedi",
    "category": "30 Men's Deals",
    "base_price": Decimal("5500.00"),
    "default_duration_minutes": 80,
    "description": "Executive Haircut + Razor Shave + Express Hand & Foot Care. (Valued at Rs. 7,800 · Save 29%)",
  },
  {
    "name": "Men's Deal 13: Royal Herbal Head Massage & Haircut",
    "category": "30 Men's Deals",
    "base_price": Decimal("4200.00"),
    "default_duration_minutes": 60,
    "description": "Ayurvedic Herbal Oil Treatment + Scalp Acupressure + Precision Haircut. (Valued at Rs. 6,000 · Save 30%)",
  },
  {
    "name": "Men's Deal 14: Refresh Cleanse & Beard Architecture",
    "category": "30 Men's Deals",
    "base_price": Decimal("4800.00"),
    "default_duration_minutes": 50,
    "description": "Deep Facial Cleanse + Expert Beard Contour + Hot Towel Treatment. (Valued at Rs. 6,800 · Save 29%)",
  },
  {
    "name": "Men's Deal 15: Beauté French Facial & Haircut",
    "category": "30 Men's Deals",
    "base_price": Decimal("7500.00"),
    "default_duration_minutes": 80,
    "description": "Beauté French Luxury Facial + Precision Haircut + Beard Trim. (Valued at Rs. 10,500 · Save 29%)",
  },
  {
    "name": "Men's Deal 16: Expert Beard Package",
    "category": "30 Men's Deals",
    "base_price": Decimal("3800.00"),
    "default_duration_minutes": 45,
    "description": "Beard Trim + Charcoal Clay Mask + Organic Beard Oil + Styling. (Valued at Rs. 5,500 · Save 31%)",
  },
  {
    "name": "Men's Deal 17: HydraFacial & Beard Styling",
    "category": "30 Men's Deals",
    "base_price": Decimal("9500.00"),
    "default_duration_minutes": 75,
    "description": "7-Step HydraFacial Machine Care + Stylish Beard Shaping + Scalp Wash. (Valued at Rs. 14,000 · Save 32%)",
  },
  {
    "name": "Men's Deal 18: Body Shop Organic Facial & Beard",
    "category": "30 Men's Deals",
    "base_price": Decimal("8200.00"),
    "default_duration_minutes": 75,
    "description": "The Body Shop Vitamin E Facial + Beard Grooming + Scalp Relax Therapy. (Valued at Rs. 11,500 · Save 29%)",
  },
  {
    "name": "Men's Deal 19: Full Luxury Spa Grooming Day",
    "category": "30 Men's Deals",
    "base_price": Decimal("11500.00"),
    "default_duration_minutes": 120,
    "description": "Haircut + Beard Sculpting + Whitening Facial + Deluxe Mani-Pedi Spa. (Valued at Rs. 16,500 · Save 30%)",
  },
  {
    "name": "Men's Deal 20: HydraFacial with Guinot French Serum",
    "category": "30 Men's Deals",
    "base_price": Decimal("13500.00"),
    "default_duration_minutes": 90,
    "description": "Hydra Vortex Infusion + Guinot Youth Serum + LED Light Treatment + Hair Wash. (Valued at Rs. 19,000 · Save 29%)",
  },
  {
    "name": "Men's Deal 21: Fashion Dye, Perming & Textured Curls",
    "category": "30 Men's Deals",
    "base_price": Decimal("14500.00"),
    "default_duration_minutes": 120,
    "description": "Fashion Colour / Highlights + Volume Perming Curls + Post-Care Mask. (Valued at Rs. 21,000 · Save 31%)",
  },
  {
    "name": "Men's Deal 22: Pure Silk Keratin / Rebonding Smoothing",
    "category": "30 Men's Deals",
    "base_price": Decimal("18500.00"),
    "default_duration_minutes": 150,
    "description": "Formaldehyde-Free Pure Silk Keratin or Permanent Rebonding + Haircut + Serum. (Valued at Rs. 26,000 · Save 29%)",
  },
  {
    "name": "Men's Deal 23: Pre-Wedding Party Grooming",
    "category": "30 Men's Deals",
    "base_price": Decimal("8500.00"),
    "default_duration_minutes": 75,
    "description": "For Brother / Best Man: Precision Haircut + Beard Sculpting + Radiant Facial. (Valued at Rs. 12,000 · Save 29%)",
  },
  {
    "name": "Men's Deal 24: VIP Complete Makeover & Relaxation Suite",
    "category": "30 Men's Deals",
    "base_price": Decimal("16000.00"),
    "default_duration_minutes": 130,
    "description": "Hair Protein Treatment + Glowing Facial + Spa Mani-Pedi + Full Styling. (Valued at Rs. 23,000 · Save 30%)",
  },
  {
    "name": "Men's Deal 25: One-Day Groom Package",
    "category": "Wedding & Groom Packages",
    "base_price": Decimal("18500.00"),
    "default_duration_minutes": 150,
    "description": "Wedding Day Precision Haircut, Beard Architecture, Whitening Facial, Spa Mani-Pedi & Dressing. (Valued at Rs. 26,000 · Save 29%)",
  },
  {
    "name": "Men's Deal 26: Two-Day Royal Grooming (Mehndi + Barat)",
    "category": "Wedding & Groom Packages",
    "base_price": Decimal("26000.00"),
    "default_duration_minutes": 200,
    "description": "Day 1 (Mehndi): Deep Facial & Spa Mani-Pedi | Day 2 (Barat): Haircut, Beard Design, Groom Dress Setting. (Valued at Rs. 36,000 · Save 28%)",
  },
  {
    "name": "Men's Deal 27: Two-Day Deluxe Groom Suite (Barat + Walima)",
    "category": "Wedding & Groom Packages",
    "base_price": Decimal("28000.00"),
    "default_duration_minutes": 200,
    "description": "Day 1 (Barat): Full Groom Preparation & Makeup | Day 2 (Walima): Refresh Facial, Beard Reshape & Styling. (Valued at Rs. 39,000 · Save 28%)",
  },
  {
    "name": "Men's Deal 28: Three-Day Elite Groom Preparation",
    "category": "Wedding & Groom Packages",
    "base_price": Decimal("36000.00"),
    "default_duration_minutes": 280,
    "description": "Mehndi, Barat & Walima Dedicated Haircut, Beard, HydraFacial, Mani-Pedi & Event Dress Setting. (Valued at Rs. 50,000 · Save 28%)",
  },
  {
    "name": "Men's Deal 29: Nikah + Walima Two-Event Master Suite",
    "category": "Wedding & Groom Packages",
    "base_price": Decimal("27000.00"),
    "default_duration_minutes": 210,
    "description": "Signature Nikah Grooming + Walima Refresh & Professional Hair/Beard Architecture. (Valued at Rs. 38,000 · Save 29%)",
  },
  {
    "name": "Men's Deal 30: Day 1, 2 & 3 Ultimate Wedding Extravaganza",
    "category": "Wedding & Groom Packages",
    "base_price": Decimal("42000.00"),
    "default_duration_minutes": 320,
    "description": "VIP Private Chair, Full 7-Step Skin Therapy, Hair Protein, 3-Event Styling & Dressing. (Valued at Rs. 60,000 · Save 30%)",
  },
]

count = 0
for item in LAVISH_CATALOG:
    svc, created = Service.objects.update_or_create(
        tenant=tenant,
        name=item["name"],
        defaults={
            "category": item["category"],
            "base_price": item["base_price"],
            "default_duration_minutes": item["default_duration_minutes"],
            "description": item["description"],
            "is_active": True,
            "public_bookable": True,
        }
    )
    # Also attach to all branches
    for b in branches:
        BranchService.objects.get_or_create(
            branch=b,
            service=svc,
            defaults={
                "price": None,
                "duration_minutes": None,
                "is_available": True,
            }
        )
    count += 1

print(f"Successfully synced {count} Lavish salon treatments and deals into Django database!")
