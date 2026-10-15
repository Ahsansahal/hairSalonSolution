import { NextRequest, NextResponse } from "next/server";

// In-Memory Cloud Store for Vercel
let branches = [
  {
    id: "b1",
    name: "Clifton Flagship Branch",
    code: "CLF-01",
    city: "Karachi",
    address: "Block 4, Clifton, Near Bilawal House",
    phone: "+92 21 35870000",
    email: "clifton@shay.salon",
  },
  {
    id: "b2",
    name: "DHA Bukhari Studio",
    code: "DHA-02",
    city: "Karachi",
    address: "Bukhari Commercial Lane 3, Phase 6",
    phone: "+92 21 35840000",
    email: "dha@shay.salon",
  },
];

let services = [
  // ========================================================
  // SINGLE SERVICES (LAVISH SALOON SPECIFICATION)
  // ========================================================

  // --- 1. Haircut & Styling Services ---
  {
    id: "svc-hair-1",
    name: "Signature Precision Haircut & Styling",
    category: "Haircut & Styling",
    base_price: 2500,
    default_duration_minutes: 45,
    description: "Face-shape consultation, classic and modern cuts, scissor work, skin fades, tapers, texture, hair wash and professional finishing.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-hair-2",
    name: "Classic Scissor Cut & Blow-Dry",
    category: "Haircut & Styling",
    base_price: 2200,
    default_duration_minutes: 40,
    description: "Traditional scissor cut based on natural growth pattern, weight removal, shampoo wash and styled blow-dry finish.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-hair-3",
    name: "Executive Hair Styling & Blow-Dry Finish",
    category: "Haircut & Styling",
    base_price: 1800,
    default_duration_minutes: 30,
    description: "Volumizing wash, heat-protected blow-dry, matte clay or pomade hold, and camera-ready styling.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-hair-4",
    name: "Expert Master Stylist Haircut & Consultation",
    category: "Haircut & Styling",
    base_price: 3500,
    default_duration_minutes: 50,
    description: "Senior art director consultation, bespoke hair architecture, scalp detox rinse, and tailored styling advice.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-hair-5",
    name: "Junior / Kids Grooming Haircut",
    category: "Haircut & Styling",
    base_price: 1500,
    default_duration_minutes: 30,
    description: "Comfortable and patient kids haircut tailored to easy daily maintenance and gentle scalp rinse.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-hair-6",
    name: "Deep Scalp Cleanse & Conditioning Rinse",
    category: "Haircut & Styling",
    base_price: 800,
    default_duration_minutes: 20,
    description: "Invigorating tea tree and peppermint shampoo, stimulating scalp pressure point wash, and smoothing conditioner.",
    is_active: true,
    public_bookable: true,
  },

  // --- 2. Beard Styling & Shave Services ---
  {
    id: "svc-beard-1",
    name: "Beard Trimming & Length Control",
    category: "Beard Styling & Shave",
    base_price: 800,
    default_duration_minutes: 25,
    description: "Clipper fade, symmetry alignment, length control, and neat moustache trimming with scissors.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-beard-2",
    name: "Beard Shaping & Razor Line-Up",
    category: "Beard Styling & Shave",
    base_price: 1200,
    default_duration_minutes: 30,
    description: "Sharp razor cheek and neckline definition, sideburn blending, and cooling aloe vera aftershave.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-beard-3",
    name: "Royal Hot Towel Straight-Razor Shave",
    category: "Beard Styling & Shave",
    base_price: 1400,
    default_duration_minutes: 35,
    description: "Pre-shave eucalyptus oil, double hot towel steam wrap, rich lather shave with a fresh blade, and cold towel close.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-beard-4",
    name: "Expert Beard Sculpting & Oil Massage",
    category: "Beard Styling & Shave",
    base_price: 1600,
    default_duration_minutes: 35,
    description: "Detailed shape sculpting, hot steam infusion, warm organic argan beard oil massage, and styling balm.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-beard-5",
    name: "Natural-Shade Beard Dye & Camouflage",
    category: "Beard Styling & Shave",
    base_price: 1800,
    default_duration_minutes: 30,
    description: "Gentle ammonia-free grey blending in natural black or brown shades, skin-safe application, and deep beard wash.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-beard-6",
    name: "Moustache Detailing & Contour",
    category: "Beard Styling & Shave",
    base_price: 600,
    default_duration_minutes: 15,
    description: "Precision scissor detailing, lip line cleanup, and wax shaping for handlebar or classic moustache.",
    is_active: true,
    public_bookable: true,
  },

  // --- 3. Hair Color & Chemical Work ---
  {
    id: "svc-chem-1",
    name: "Men's Head Hair Color & Grey Blending",
    category: "Hair Color & Chemical Work",
    base_price: 3800,
    default_duration_minutes: 60,
    description: "Shade consultation for seamless natural grey coverage or full color change with scalp protective barrier.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-chem-2",
    name: "Men's Fashion Colour & Foil Highlights",
    category: "Hair Color & Chemical Work",
    base_price: 6500,
    default_duration_minutes: 90,
    description: "Ash blonde, platinum streaks, or caramel highlights with bond-protecting plex treatment and gloss toner.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-chem-3",
    name: "Men's Perming & Textured Curls",
    category: "Hair Color & Chemical Work",
    base_price: 8500,
    default_duration_minutes: 120,
    description: "Korean wavy perm or textured curls for volume, body and effortless day-to-day messy styling.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-chem-4",
    name: "Keratin Smoothing & Anti-Frizz Treatment",
    category: "Hair Color & Chemical Work",
    base_price: 14000,
    default_duration_minutes: 150,
    description: "Formaldehyde-free pure silk keratin infusion, eliminates frizz, locks in shine, lasts 3 to 5 months.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-chem-5",
    name: "Hair Rebonding / Permanent Straightening",
    category: "Hair Color & Chemical Work",
    base_price: 16000,
    default_duration_minutes: 180,
    description: "Permanent structural straightening for unruly coarse hair with neutralizing gloss and thermal seal.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-chem-6",
    name: "Deep Hair Protein & Follicle Repair",
    category: "Hair Color & Chemical Work",
    base_price: 4800,
    default_duration_minutes: 60,
    description: "Hydrolyzed wheat and keratin protein mask under thermal steam cap to restore dry, porous, or heat-damaged hair.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-chem-7",
    name: "Restorative Scalp Ritual & Hair Spa Mask",
    category: "Hair Color & Chemical Work",
    base_price: 4200,
    default_duration_minutes: 50,
    description: "Dead sea salt scalp scrub, essential botanical oils, relaxing 20-minute head massage, and nourishing cream bath.",
    is_active: true,
    public_bookable: true,
  },

  // --- 4. Facial & Skin Care ---
  {
    id: "svc-face-1",
    name: "HydraFacial 7-Step Deep Pore Hydration",
    category: "Facial & Skin Care",
    base_price: 8500,
    default_duration_minutes: 60,
    description: "Vortex vacuum extraction of blackheads, glycolic acid peeling, ultrasonic serum infusion, and cold hammer firming.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-face-2",
    name: "Jessica Whitening & Radiance Facial",
    category: "Facial & Skin Care",
    base_price: 5200,
    default_duration_minutes: 60,
    description: "Jessica professional skincare whitening scrub, deep pore cleansing, brightening fruit pack, and glowing skin finish.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-face-3",
    name: "Dermacose Herbal / Acne Purifying Facial",
    category: "Facial & Skin Care",
    base_price: 5800,
    default_duration_minutes: 60,
    description: "Targeted treatment for oily and acne-prone skin: tea tree cleanse, sebum balancing, high-frequency ozone therapy.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-face-4",
    name: "Beauté French Anti-Pollution Cleanse",
    category: "Facial & Skin Care",
    base_price: 4500,
    default_duration_minutes: 45,
    description: "Surface cleansing, botanical scrub, and antioxidant hydration to reverse urban smoke, dust, and sun tan.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-face-5",
    name: "Deep Pore Cleansing & Blackhead Extraction",
    category: "Facial & Skin Care",
    base_price: 2500,
    default_duration_minutes: 35,
    description: "Warm herbal steam, ultrasonic skin scrubber pore clearing, nose blackhead extraction, and pore-minimizing toner.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-face-6",
    name: "HydraFacial with Guinot French Serum & LED",
    category: "Facial & Skin Care",
    base_price: 12500,
    default_duration_minutes: 75,
    description: "Clinical Hydra machine suction + Guinot cellular youth concentrate + 7-wavelength LED photo-rejuvenation light.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-face-7",
    name: "The Body Shop Organic Vitamin E Facial",
    category: "Facial & Skin Care",
    base_price: 7200,
    default_duration_minutes: 60,
    description: "Wheatgerm oil and Vitamin E enriched moisture surge, soothing facial massage, and moisture barrier lock.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-face-8",
    name: "Active Charcoal Deep Detox Facial",
    category: "Facial & Skin Care",
    base_price: 3800,
    default_duration_minutes: 45,
    description: "Activated bamboo charcoal clay mask, draws out trapped impurities, eliminates excess sebum, leaves skin clean and matte.",
    is_active: true,
    public_bookable: true,
  },

  // --- 5. Groom & Event Services ---
  {
    id: "svc-groom-1",
    name: "Deluxe Spa Herbal Manicure & Pedicure",
    category: "Groom & Event Services",
    base_price: 3500,
    default_duration_minutes: 60,
    description: "Warm mineral salt soak, cuticle cleanup, heel calluses buffing, apricot walnut scrub, and relaxing hand & foot massage.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "svc-groom-2",
    name: "Event Groom Dressing & Styling",
    category: "Groom & Event Services",
    base_price: 5000,
    default_duration_minutes: 45,
    description: "Turban tying, sherwani alignment, pocket square placement, light matte camera touch-up, and perfume mist.",
    is_active: true,
    public_bookable: true,
  },

  // ========================================================
  // 30 MEN'S DEALS (NUMBERED 01 TO 30 - LAVISH SPECIFICATION)
  // ========================================================
  {
    id: "deal-01",
    name: "Men's Deal 01: Haircut & Stylish Beard",
    category: "30 Men's Deals",
    base_price: 3500,
    default_duration_minutes: 60,
    description: "Professional Precision Haircut + Stylish Beard Trim & Shaping + Scalp Cleanse + Hot Towel Refreshment. (Valued at Rs. 5,000 · Save 30%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-02",
    name: "Men's Deal 02: Jessica Whitening Facial & Haircut",
    category: "30 Men's Deals",
    base_price: 6200,
    default_duration_minutes: 75,
    description: "Jessica Whitening Facial + Precision Haircut + Scalp Wash + Refreshing Mint Towel. (Valued at Rs. 8,500 · Save 27%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-03",
    name: "Men's Deal 03: Styling Beard & Dermacose Facial",
    category: "30 Men's Deals",
    base_price: 6500,
    default_duration_minutes: 75,
    description: "Dermacose Herbal Facial + Expert Beard Trim & Razor Lineup + Steam Therapy. (Valued at Rs. 9,000 · Save 28%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-04",
    name: "Men's Deal 04: Beard Dye & Head Color Combo",
    category: "30 Men's Deals",
    base_price: 5800,
    default_duration_minutes: 60,
    description: "Natural Shade Beard Dye + Head Hair Color / Grey Blending + Conditioning Wash. (Valued at Rs. 8,000 · Save 28%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-05",
    name: "Men's Deal 05: Jessica Facial Package & Grooming",
    category: "30 Men's Deals",
    base_price: 6900,
    default_duration_minutes: 90,
    description: "Jessica Cleansing Facial + Haircut + Beard Sculpting + Scalp Wash. (Valued at Rs. 9,500 · Save 27%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-06",
    name: "Men's Deal 06: Hair Protein & Nourishing Hair Spa",
    category: "30 Men's Deals",
    base_price: 5500,
    default_duration_minutes: 60,
    description: "Intense Protein Repair Mask + Hot Towel Hair Spa + Scalp Massage + Wash & Blow-dry. (Valued at Rs. 7,500 · Save 27%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-07",
    name: "Men's Deal 07: Deluxe Spa Facial & Reflexology",
    category: "30 Men's Deals",
    base_price: 5800,
    default_duration_minutes: 60,
    description: "Deep Spa Facial + Neck & Shoulder Tension Release Massage + Face Scrub. (Valued at Rs. 8,000 · Save 28%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-08",
    name: "Men's Deal 08: Hair Protein, Haircut & Styling",
    category: "30 Men's Deals",
    base_price: 6500,
    default_duration_minutes: 75,
    description: "Deep Hair Protein Mask + Precision Haircut + Matte Styling + Hair Rinse. (Valued at Rs. 9,000 · Save 28%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-09",
    name: "Men's Deal 09: Beard & Facial Combo",
    category: "30 Men's Deals",
    base_price: 5200,
    default_duration_minutes: 60,
    description: "Beard Sculpting & Lineup + Cleansing Glow Facial + Mint Towel. (Valued at Rs. 7,500 · Save 31%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-10",
    name: "Men's Deal 10: Stylish Beard & Deep Pore Facial",
    category: "30 Men's Deals",
    base_price: 5900,
    default_duration_minutes: 70,
    description: "Stylish Beard Trim + Deep Pore Facial + Blackhead Removal Scrub. (Valued at Rs. 8,200 · Save 28%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-11",
    name: "Men's Deal 11: Acne Purifying Facial Package",
    category: "30 Men's Deals",
    base_price: 7200,
    default_duration_minutes: 75,
    description: "Anti-Bacterial Acne Facial + High-Frequency Therapy + Precision Haircut. (Valued at Rs. 10,000 · Save 28%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-12",
    name: "Men's Deal 12: Executive Haircut, Shave & Mani-Pedi",
    category: "30 Men's Deals",
    base_price: 5500,
    default_duration_minutes: 80,
    description: "Executive Haircut + Razor Shave + Express Hand & Foot Care. (Valued at Rs. 7,800 · Save 29%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-13",
    name: "Men's Deal 13: Royal Herbal Head Massage & Haircut",
    category: "30 Men's Deals",
    base_price: 4200,
    default_duration_minutes: 60,
    description: "Ayurvedic Herbal Oil Treatment + Scalp Acupressure + Precision Haircut. (Valued at Rs. 6,000 · Save 30%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-14",
    name: "Men's Deal 14: Refresh Cleanse & Beard Architecture",
    category: "30 Men's Deals",
    base_price: 4800,
    default_duration_minutes: 50,
    description: "Deep Facial Cleanse + Expert Beard Contour + Hot Towel Treatment. (Valued at Rs. 6,800 · Save 29%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-15",
    name: "Men's Deal 15: Beauté French Facial & Haircut",
    category: "30 Men's Deals",
    base_price: 7500,
    default_duration_minutes: 80,
    description: "Beauté French Luxury Facial + Precision Haircut + Beard Trim. (Valued at Rs. 10,500 · Save 29%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-16",
    name: "Men's Deal 16: Expert Beard Package",
    category: "30 Men's Deals",
    base_price: 3800,
    default_duration_minutes: 45,
    description: "Beard Trim + Charcoal Clay Mask + Organic Beard Oil + Styling. (Valued at Rs. 5,500 · Save 31%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-17",
    name: "Men's Deal 17: HydraFacial & Beard Styling",
    category: "30 Men's Deals",
    base_price: 9500,
    default_duration_minutes: 75,
    description: "7-Step HydraFacial Machine Care + Stylish Beard Shaping + Scalp Wash. (Valued at Rs. 14,000 · Save 32%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-18",
    name: "Men's Deal 18: Body Shop Organic Facial & Beard",
    category: "30 Men's Deals",
    base_price: 8200,
    default_duration_minutes: 75,
    description: "The Body Shop Vitamin E Facial + Beard Grooming + Scalp Relax Therapy. (Valued at Rs. 11,500 · Save 29%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-19",
    name: "Men's Deal 19: Full Luxury Spa Grooming Day",
    category: "30 Men's Deals",
    base_price: 11500,
    default_duration_minutes: 120,
    description: "Haircut + Beard Sculpting + Whitening Facial + Deluxe Mani-Pedi Spa. (Valued at Rs. 16,500 · Save 30%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-20",
    name: "Men's Deal 20: HydraFacial with Guinot French Serum",
    category: "30 Men's Deals",
    base_price: 13500,
    default_duration_minutes: 90,
    description: "Hydra Vortex Infusion + Guinot Youth Serum + LED Light Treatment + Hair Wash. (Valued at Rs. 19,000 · Save 29%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-21",
    name: "Men's Deal 21: Fashion Dye, Perming & Textured Curls",
    category: "30 Men's Deals",
    base_price: 14500,
    default_duration_minutes: 120,
    description: "Fashion Colour / Highlights + Volume Perming Curls + Post-Care Mask. (Valued at Rs. 21,000 · Save 31%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-22",
    name: "Men's Deal 22: Pure Silk Keratin / Rebonding Smoothing",
    category: "30 Men's Deals",
    base_price: 18500,
    default_duration_minutes: 150,
    description: "Formaldehyde-Free Pure Silk Keratin or Permanent Rebonding + Haircut + Serum. (Valued at Rs. 26,000 · Save 29%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-23",
    name: "Men's Deal 23: Pre-Wedding Party Grooming",
    category: "30 Men's Deals",
    base_price: 8500,
    default_duration_minutes: 75,
    description: "For Brother / Best Man: Precision Haircut + Beard Sculpting + Radiant Facial. (Valued at Rs. 12,000 · Save 29%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-24",
    name: "Men's Deal 24: VIP Complete Makeover & Relaxation Suite",
    category: "30 Men's Deals",
    base_price: 16000,
    default_duration_minutes: 130,
    description: "Hair Protein Treatment + Glowing Facial + Spa Mani-Pedi + Full Styling. (Valued at Rs. 23,000 · Save 30%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-25",
    name: "Men's Deal 25: One-Day Groom Package",
    category: "Wedding & Groom Packages",
    base_price: 18500,
    default_duration_minutes: 150,
    description: "Wedding Day Precision Haircut, Beard Architecture, Whitening Facial, Spa Mani-Pedi & Dressing. (Valued at Rs. 26,000 · Save 29%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-26",
    name: "Men's Deal 26: Two-Day Royal Grooming (Mehndi + Barat)",
    category: "Wedding & Groom Packages",
    base_price: 26000,
    default_duration_minutes: 200,
    description: "Day 1 (Mehndi): Deep Facial & Spa Mani-Pedi | Day 2 (Barat): Haircut, Beard Design, Groom Dress Setting. (Valued at Rs. 36,000 · Save 28%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-27",
    name: "Men's Deal 27: Two-Day Deluxe Groom Suite (Barat + Walima)",
    category: "Wedding & Groom Packages",
    base_price: 28000,
    default_duration_minutes: 200,
    description: "Day 1 (Barat): Full Groom Preparation & Makeup | Day 2 (Walima): Refresh Facial, Beard Reshape & Styling. (Valued at Rs. 39,000 · Save 28%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-28",
    name: "Men's Deal 28: Three-Day Elite Groom Preparation",
    category: "Wedding & Groom Packages",
    base_price: 36000,
    default_duration_minutes: 280,
    description: "Mehndi, Barat & Walima Dedicated Haircut, Beard, HydraFacial, Mani-Pedi & Event Dress Setting. (Valued at Rs. 50,000 · Save 28%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-29",
    name: "Men's Deal 29: Nikah + Walima Two-Event Master Suite",
    category: "Wedding & Groom Packages",
    base_price: 27000,
    default_duration_minutes: 210,
    description: "Signature Nikah Grooming + Walima Refresh & Professional Hair/Beard Architecture. (Valued at Rs. 38,000 · Save 29%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "deal-30",
    name: "Men's Deal 30: Day 1, 2 & 3 Ultimate Wedding Extravaganza",
    category: "Wedding & Groom Packages",
    base_price: 42000,
    default_duration_minutes: 320,
    description: "VIP Private Chair, Full 7-Step Skin Therapy, Hair Protein, 3-Event Styling & Dressing. (Valued at Rs. 60,000 · Save 30%)",
    is_active: true,
    public_bookable: true,
  },
];

let staffList = [
  { id: "st1", employee_code: "EMP-001", full_name: "Aliya Rizvi", title: "Senior Creative Stylist", is_active: true },
  { id: "st2", employee_code: "EMP-002", full_name: "Tariq Mehmood", title: "Master Barber & Beard Architect", is_active: true },
  { id: "st3", employee_code: "EMP-003", full_name: "Dr. Sana Hashmi", title: "Clinical Esthetician", is_active: true },
  { id: "st4", employee_code: "EMP-004", full_name: "Bilal Qureshi", title: "Lead Colorist & Texture Specialist", is_active: true },
  { id: "st5", employee_code: "EMP-005", full_name: "Mehak Fatima", title: "Bridal & Hair Spa Director", is_active: true },
];

let appointments: any[] = [
  {
    id: "app-101",
    booking_reference: "SHAY-CLF-8921",
    customer_name: "Shayan Merchant",
    customer_phone: "+92 300 1234567",
    customer_email: "shayan@example.com",
    service_names: ["SHAY Deal 01: Executive Grooming Suite"],
    staff_name: "Aliya Rizvi",
    branch_name: "Clifton Flagship Branch",
    branch_id: "b1",
    start_time: new Date().toISOString(),
    status: "CONFIRMED",
    source: "WALK_IN",
    total_amount: 4500,
  },
  {
    id: "app-102",
    booking_reference: "SHAY-DHA-4412",
    customer_name: "Zainab Tariq",
    customer_phone: "+92 321 9876543",
    customer_email: "zainab@example.com",
    service_names: ["Hydra-Glow Luxury Facial"],
    staff_name: "Dr. Sana Hashmi",
    branch_name: "DHA Bukhari Studio",
    branch_id: "b2",
    start_time: new Date(Date.now() + 3600000).toISOString(),
    status: "CONFIRMED",
    source: "ONLINE",
    total_amount: 9500,
  },
];

let invoices: any[] = [
  {
    id: "inv-101",
    invoice_number: "SHAY-INV-2026-9041",
    customer_name: "Shayan Merchant",
    customer_phone: "+92 300 1234567",
    branch_name: "Clifton Flagship Branch",
    status: "PAID",
    subtotal_amount: 14000,
    tax_amount: 1820,
    total_amount: 15820,
    amount_paid: 15820,
    balance_due: 0,
    issued_at: new Date().toISOString(),
    items: [
      { name: "SHAY Deal 01: Executive Grooming Suite", quantity: 1, unit_price: 4500, total_price: 4500 },
      { name: "Hydra-Glow Luxury Facial", quantity: 1, unit_price: 9500, total_price: 9500 },
    ],
    payments: [{ method: "CARD (Bank Alfalah)", amount: 15820 }],
  },
  {
    id: "inv-102",
    invoice_number: "SHAY-INV-2026-9042",
    customer_name: "Farhan Siddiqui",
    customer_phone: "+92 333 4455667",
    branch_name: "DHA Bukhari Studio",
    status: "ISSUED",
    subtotal_amount: 5500,
    tax_amount: 715,
    total_amount: 6215,
    amount_paid: 0,
    balance_due: 6215,
    issued_at: new Date().toISOString(),
    items: [
      { name: "SHAY Deal 06: Deluxe Spa Mani-Pedi & Head Therapy", quantity: 1, unit_price: 5500, total_price: 5500 },
    ],
    payments: [],
  },
];

let customers = [
  {
    id: "c1",
    full_name: "Shayan Merchant",
    phone: "+92 300 1234567",
    email: "shayan@example.com",
    city: "Karachi",
    total_visits: 14,
    total_spend: 68500,
    preferred_branch: "Clifton Flagship Branch",
    notes: "Prefers Moroccan Argan hair rinse & hot towel service.",
  },
  {
    id: "c2",
    full_name: "Zainab Tariq",
    phone: "+92 321 9876543",
    email: "zainab@example.com",
    city: "Karachi",
    total_visits: 8,
    total_spend: 42000,
    preferred_branch: "DHA Bukhari Studio",
    notes: "Sensitive skin, organic tea tree cleansers only.",
  },
];

let inventory = [
  { id: "inv1", product_name: "Moroccan Argan Repair Shampoo 250ml", sku: "MOR-SHA-250", quantity_on_hand: 28, unit_retail_price: 3200 },
  { id: "inv2", product_name: "Pure Silk Keratin Post-Care Mask 500ml", sku: "SILK-MSK-500", quantity_on_hand: 14, unit_retail_price: 6500 },
  { id: "inv3", product_name: "Organic Charcoal Beard Oil 50ml", sku: "CHRC-BRD-050", quantity_on_hand: 35, unit_retail_price: 1800 },
];

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const path = params.slug.join("/").replace(/\/$/, "");
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branch_id") || "all";

  // 1. Branches
  if (path === "branches" || path === "public/branches") {
    return NextResponse.json(branches);
  }

  // 2. Services & Catalog
  if (path === "services" || path === "public/services") {
    return NextResponse.json(services);
  }

  if (path === "public/catalog") {
    return NextResponse.json({
      services: services,
      staff: staffList,
    });
  }

  // 2.5 Branch Services Overrides
  if (path === "branch-services") {
    return NextResponse.json(
      services.slice(0, 15).map((s) => ({
        id: `bs-${s.id}`,
        service: s.id,
        service_name: s.name,
        service_category: s.category,
        branch_name: branchId === "b2" ? "DHA Bukhari Studio" : "Clifton Flagship Branch",
        effective_price: s.base_price,
        effective_duration: s.default_duration_minutes,
        is_active: true,
      }))
    );
  }

  // 3. Staff (Filtered by branch if specified)
  if (path === "staff") {
    if (branchId === "b1") {
      // Clifton Staff
      const clfStaff = staffList.filter((s) => ["st1", "st2", "st4"].includes(s.id));
      return NextResponse.json(clfStaff);
    } else if (branchId === "b2") {
      // DHA Bukhari Staff
      const dhaStaff = staffList.filter((s) => ["st3", "st5"].includes(s.id));
      return NextResponse.json(dhaStaff);
    }
    return NextResponse.json(staffList);
  }

  // 4. Dashboard Summary (Dynamic Branch Progress & Updates)
  if (path === "dashboard/summary") {
    if (branchId === "b1") {
      // Clifton Flagship Branch Specific
      const clifAppts = appointments.filter((a) => a.branch_id === "b1" || !a.branch_id);
      return NextResponse.json({
        active_branch: {
          id: "b1",
          name: "Clifton Flagship Branch",
          code: "CLF-01",
          city: "Karachi",
          address: "Block 4, Clifton, Near Bilawal House",
          target_revenue: 120000,
          current_revenue: 98000,
          target_progress_percent: 81.6,
          total_chairs: 6,
          occupied_chairs: 5,
          utilization_percent: 83,
          status: "ONLINE_ACTIVE",
        },
        metrics: {
          today_appointments: 15,
          today_confirmed: 10,
          today_completed: 5,
          active_staff_count: 5,
          today_revenue: 98000,
          upcoming_appointments: 11,
          deals_count: 4,
          growth_percent: 8,
        },
        category_breakdown: {
          hair: 26,
          beard: 24,
          hydra: 22,
          deals: 32,
          groom: 30,
        },
        recent_appointments: clifAppts,
        recent_activities: [
          {
            id: "act-1",
            title: "Walk-In Guest Seated",
            detail: "Sophia Martinez (Chair 02 · Clifton Block 4)",
            time: "10:24 AM",
            type: "SEATED",
            branch: "Clifton Flagship",
          },
          {
            id: "act-2",
            title: "SHAY Deal 01 Completed",
            detail: "Ethan Johnson (Stylist: Aliya Rizvi)",
            time: "09:15 AM",
            type: "SERVICE_DONE",
            branch: "Clifton Flagship",
          },
          {
            id: "act-3",
            title: "Invoice Paid (Rs. 15,820)",
            detail: "POS Terminal 01 (Bank Alfalah) · Shayan Merchant",
            time: "08:50 AM",
            type: "PAYMENT",
            branch: "Clifton Flagship",
          },
        ],
        upcoming_schedule: [
          {
            date_label: "OCT 15",
            title: "Royal Grooming Suite",
            guest: "VIP Shayan Merchant · Chair 01",
            time: "02:00 PM - 03:30 PM",
            staff: "Aliya Rizvi",
            branch: "Clifton Flagship",
          },
          {
            date_label: "OCT 16",
            title: "Keratin Silk Treatment",
            guest: "Elena Rostova",
            time: "04:00 PM - 07:00 PM",
            staff: "Bilal Qureshi",
            branch: "Clifton Flagship",
          },
        ],
        branch_breakdown: [
          {
            branch_id: "b1",
            name: "Clifton Flagship Branch",
            city: "Karachi",
            today_appointments: 15,
            today_revenue: "98000.00",
            target_revenue: "120000.00",
            active_staff: 5,
          },
        ],
      });
    } else if (branchId === "b2") {
      // DHA Bukhari Studio Specific
      const dhaAppts = appointments.filter((a) => a.branch_id === "b2");
      return NextResponse.json({
        active_branch: {
          id: "b2",
          name: "DHA Bukhari Studio",
          code: "DHA-02",
          city: "Karachi",
          address: "Bukhari Commercial Lane 3, Phase 6",
          target_revenue: 75000,
          current_revenue: 58500,
          target_progress_percent: 78.0,
          total_chairs: 4,
          occupied_chairs: 3,
          utilization_percent: 75,
          status: "ONLINE_ACTIVE",
        },
        metrics: {
          today_appointments: 9,
          today_confirmed: 6,
          today_completed: 3,
          active_staff_count: 3,
          today_revenue: 58500,
          upcoming_appointments: 7,
          deals_count: 2,
          growth_percent: 11,
        },
        category_breakdown: {
          hair: 16,
          beard: 14,
          hydra: 18,
          deals: 20,
          groom: 20,
        },
        recent_appointments: dhaAppts.length > 0 ? dhaAppts : [
          {
            id: "app-102",
            booking_reference: "SHAY-DHA-4412",
            customer_name: "Zainab Tariq",
            customer_phone: "+92 321 9876543",
            service_names: ["Hydra-Glow Luxury Facial"],
            staff_name: "Dr. Sana Hashmi",
            branch_name: "DHA Bukhari Studio",
            branch_id: "b2",
            start_time: new Date(Date.now() + 1800000).toISOString(),
            status: "CONFIRMED",
            source: "ONLINE",
            total_amount: 9500,
          },
        ],
        recent_activities: [
          {
            id: "act-d1",
            title: "Hydra-Luxe Facial Session Active",
            detail: "Dr. Sana Hashmi with Zainab Tariq (Suite B)",
            time: "11:15 AM",
            type: "SERVICE_ACTIVE",
            branch: "DHA Bukhari Studio",
          },
          {
            id: "act-d2",
            title: "WhatsApp Booking Request",
            detail: "Mrs. Thompson (Hydra-Glow Facial inquiry)",
            time: "09:40 AM",
            type: "WHATSAPP",
            branch: "DHA Bukhari Studio",
          },
          {
            id: "act-d3",
            title: "Invoice Paid (Rs. 6,215)",
            detail: "Farhan Siddiqui · Deluxe Spa Mani-Pedi",
            time: "08:30 AM",
            type: "PAYMENT",
            branch: "DHA Bukhari Studio",
          },
        ],
        upcoming_schedule: [
          {
            date_label: "OCT 15",
            title: "Hydra-Glow Luxury Facial",
            guest: "Zainab Tariq · Esthetics Suite B",
            time: "01:30 PM - 02:45 PM",
            staff: "Dr. Sana Hashmi",
            branch: "DHA Bukhari Studio",
          },
          {
            date_label: "OCT 17",
            title: "Bridal Consultation & Glow Prep",
            guest: "Amina Alvi",
            time: "03:00 PM - 04:30 PM",
            staff: "Mehak Fatima",
            branch: "DHA Bukhari Studio",
          },
        ],
        branch_breakdown: [
          {
            branch_id: "b2",
            name: "DHA Bukhari Studio",
            city: "Karachi",
            today_appointments: 9,
            today_revenue: "58500.00",
            target_revenue: "75000.00",
            active_staff: 3,
          },
        ],
      });
    }

    // Consolidated (All Branches)
    return NextResponse.json({
      active_branch: {
        id: "all",
        name: "Consolidated Karachi Network",
        code: "ALL-HQ",
        city: "Karachi",
        address: "HQ Multi-Branch Real-Time Monitoring",
        target_revenue: 195000,
        current_revenue: 156500,
        target_progress_percent: 80.2,
        total_chairs: 10,
        occupied_chairs: 8,
        utilization_percent: 80,
        status: "NETWORK_HEALTHY",
      },
      metrics: {
        today_appointments: 24,
        today_confirmed: 16,
        today_completed: 8,
        active_staff_count: 8,
        today_revenue: 156500,
        upcoming_appointments: 18,
        deals_count: 6,
        growth_percent: 12,
      },
      category_breakdown: {
        hair: 42,
        beard: 38,
        hydra: 40,
        deals: 52,
        groom: 50,
      },
      recent_appointments: appointments,
      recent_activities: [
        {
          id: "act-1",
          title: "Walk-In Guest Seated",
          detail: "Sophia Martinez (Chair 02 · Clifton)",
          time: "10:24 AM",
          type: "SEATED",
          branch: "Clifton Flagship",
        },
        {
          id: "act-2",
          title: "SHAY Deal 01 Completed",
          detail: "Ethan Johnson (Aliya Rizvi · Clifton)",
          time: "09:15 AM",
          type: "SERVICE_DONE",
          branch: "Clifton Flagship",
        },
        {
          id: "act-3",
          title: "WhatsApp Booking Request",
          detail: "Mrs. Thompson (Hydra-Glow Facial · DHA)",
          time: "08:42 AM",
          type: "WHATSAPP",
          branch: "DHA Bukhari",
        },
        {
          id: "act-4",
          title: "Invoice Paid (Rs. 19,500)",
          detail: "Card Terminal Alfalah · Royal Groom Package",
          time: "Yesterday",
          type: "PAYMENT",
          branch: "Clifton Flagship",
        },
      ],
      upcoming_schedule: [
        {
          date_label: "OCT 15",
          title: "Royal Grooming Suite",
          guest: "VIP Shayan Merchant · 02:00 PM",
          time: "02:00 PM - 04:30 PM",
          staff: "Aliya Rizvi",
          branch: "Clifton Flagship",
        },
        {
          date_label: "OCT 15",
          title: "Hydra-Glow Luxury Facial",
          guest: "Zainab Tariq · 01:30 PM",
          time: "01:30 PM - 02:45 PM",
          staff: "Dr. Sana Hashmi",
          branch: "DHA Bukhari",
        },
        {
          date_label: "OCT 16",
          title: "Keratin Silk Treatment",
          guest: "Elena Rostova · 04:00 PM",
          time: "04:00 PM - 07:00 PM",
          staff: "Bilal Qureshi",
          branch: "Clifton Flagship",
        },
      ],
      branch_breakdown: [
        {
          branch_id: "b1",
          name: "Clifton Flagship Branch",
          city: "Karachi",
          today_appointments: 15,
          today_revenue: "98000.00",
          target_revenue: "120000.00",
          active_staff: 5,
          progress_percent: 81.6,
        },
        {
          branch_id: "b2",
          name: "DHA Bukhari Studio",
          city: "Karachi",
          today_appointments: 9,
          today_revenue: "58500.00",
          target_revenue: "75000.00",
          active_staff: 3,
          progress_percent: 78.0,
        },
      ],
    });
  }

  // 5. Appointments (Filter by branch if provided)
  if (path === "appointments") {
    if (branchId && branchId !== "all") {
      const filtered = appointments.filter((a) => a.branch_id === branchId);
      return NextResponse.json(filtered);
    }
    return NextResponse.json(appointments);
  }

  // 6. Invoices (Filter by branch if provided)
  if (path === "billing/invoices") {
    if (branchId === "b1") {
      return NextResponse.json(invoices.filter((inv) => inv.branch_name?.includes("Clifton")));
    } else if (branchId === "b2") {
      return NextResponse.json(invoices.filter((inv) => inv.branch_name?.includes("DHA")));
    }
    return NextResponse.json(invoices);
  }

  // 7. Inventory
  if (path === "inventory/stocks") {
    return NextResponse.json(inventory);
  }

  // 8. Customers
  if (path === "customers") {
    return NextResponse.json(customers);
  }

  // 9. Daily Sales Report
  if (path === "reports/daily-sales") {
    const isClifton = branchId === "b1";
    const isDha = branchId === "b2";
    const salesTotal = isClifton ? 98000 : isDha ? 58500 : 156500;
    const cashTotal = isClifton ? 28000 : isDha ? 17000 : 45000;
    const cardTotal = salesTotal - cashTotal;
    const srbTax = Math.round(salesTotal * 0.13);

    return NextResponse.json({
      date: new Date().toISOString().split("T")[0],
      branch_id: branchId,
      branch_name: isClifton ? "Clifton Flagship Branch" : isDha ? "DHA Bukhari Studio" : "Consolidated Network",
      total_sales: salesTotal,
      cash_sales: cashTotal,
      card_sales: cardTotal,
      tax_collected: srbTax, // 13% SRB SST
      staff_commissions: Math.round(salesTotal * 0.15),
      total_invoices: isClifton ? 15 : isDha ? 9 : 24,
      appointments_served: isClifton ? 15 : isDha ? 9 : 24,
    });
  }

  // 10. Attendance Devices
  if (path === "attendance/devices") {
    const devicesList = [
      {
        id: "dev1",
        device_name: "Clifton Front Desk Biometric Terminal",
        ip_address: "192.168.1.101",
        is_online: true,
        branch_name: "Clifton Flagship Branch",
        branch_id: "b1",
        serial_number: "ZK-BIO-9021",
        last_heartbeat: new Date().toISOString(),
      },
      {
        id: "dev2",
        device_name: "DHA Reception Face Scanner",
        ip_address: "192.168.2.102",
        is_online: true,
        branch_name: "DHA Bukhari Studio",
        branch_id: "b2",
        serial_number: "ZK-FACE-8812",
        last_heartbeat: new Date().toISOString(),
      },
    ];
    if (branchId && branchId !== "all") {
      return NextResponse.json(devicesList.filter((d) => d.branch_id === branchId));
    }
    return NextResponse.json(devicesList);
  }

  // 11. Attendance Summaries
  if (path === "attendance/summaries") {
    const summariesList = [
      {
        id: "sum1",
        staff_name: "Aliya Rizvi",
        employee_code: "EMP-001",
        branch_name: "Clifton Flagship",
        branch_id: "b1",
        shift_date: new Date().toISOString().split("T")[0],
        check_in_time: "08:55 AM",
        check_out_time: null,
        total_hours: 5.2,
        overtime_hours: 0,
        status: "PRESENT",
        punctuality: "ON_TIME",
      },
      {
        id: "sum2",
        staff_name: "Tariq Mehmood",
        employee_code: "EMP-002",
        branch_name: "Clifton Flagship",
        branch_id: "b1",
        shift_date: new Date().toISOString().split("T")[0],
        check_in_time: "09:02 AM",
        check_out_time: null,
        total_hours: 5.0,
        overtime_hours: 0,
        status: "PRESENT",
        punctuality: "ON_TIME",
      },
      {
        id: "sum3",
        staff_name: "Dr. Sana Hashmi",
        employee_code: "EMP-003",
        branch_name: "DHA Bukhari",
        branch_id: "b2",
        shift_date: new Date().toISOString().split("T")[0],
        check_in_time: "09:30 AM",
        check_out_time: null,
        total_hours: 4.5,
        overtime_hours: 0,
        status: "PRESENT",
        punctuality: "ON_TIME",
      },
      {
        id: "sum4",
        staff_name: "Bilal Qureshi",
        employee_code: "EMP-004",
        branch_name: "Clifton Flagship",
        branch_id: "b1",
        shift_date: new Date().toISOString().split("T")[0],
        check_in_time: "09:10 AM",
        check_out_time: null,
        total_hours: 4.8,
        overtime_hours: 0,
        status: "PRESENT",
        punctuality: "ON_TIME",
      },
      {
        id: "sum5",
        staff_name: "Mehak Fatima",
        employee_code: "EMP-005",
        branch_name: "DHA Bukhari",
        branch_id: "b2",
        shift_date: new Date().toISOString().split("T")[0],
        check_in_time: "09:45 AM",
        check_out_time: null,
        total_hours: 4.2,
        overtime_hours: 0,
        status: "PRESENT",
        punctuality: "ON_TIME",
      },
    ];
    if (branchId && branchId !== "all") {
      return NextResponse.json(summariesList.filter((s) => s.branch_id === branchId));
    }
    return NextResponse.json(summariesList);
  }

  // 12. Payroll Runs
  if (path === "payroll/runs") {
    const payrollRunsList = [
      {
        id: "pay-1",
        run_code: "PAY-2026-OCT-W2",
        period_start: "2026-10-01",
        period_end: "2026-10-15",
        status: "DRAFT",
        total_gross_pay: 285000,
        total_commissions: 42750,
        total_net_disbursed: 327750,
        staff_count: 8,
        branch_name: "Consolidated Karachi Network",
      },
      {
        id: "pay-2",
        run_code: "PAY-2026-SEP-FINAL",
        period_start: "2026-09-16",
        period_end: "2026-09-30",
        status: "DISBURSED",
        total_gross_pay: 570000,
        total_commissions: 85500,
        total_net_disbursed: 655500,
        staff_count: 8,
        branch_name: "Consolidated Karachi Network",
      },
    ];
    return NextResponse.json(payrollRunsList);
  }

  return NextResponse.json({ message: "SHAY Cloud API Active", path });
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const path = params.slug.join("/");
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {}

  // 1. Authentication
  if (path === "auth/login") {
    const email = body.email?.toLowerCase().trim();

    // Stylist block rule (as requested: staff only punches in/out)
    if (email === "aliya.rizvi@shay.salon") {
      return NextResponse.json(
        { detail: "Artisans and stylists do not have dashboard portal access. Please record your shifts at the salon check-in/out station." },
        { status: 401 }
      );
    }

    const roleMap: Record<string, any> = {
      "owner@shay.salon": {
        id: "u-owner",
        email: "owner@shay.salon",
        full_name: "Shayan Merchant",
        system_role: "BUSINESS_OWNER",
        branch_roles: [],
      },
      "accountant@shay.salon": {
        id: "u-acc",
        email: "accountant@shay.salon",
        full_name: "Farhan Siddiqui",
        system_role: "STAFF",
        branch_roles: [{ branch_id: "b1", role: "ACCOUNTANT" }],
      },
      "manager.clifton@shay.salon": {
        id: "u-m-clf",
        email: "manager.clifton@shay.salon",
        full_name: "Zainab Tariq",
        system_role: "STAFF",
        branch_roles: [{ branch_id: "b1", role: "BRANCH_MANAGER" }],
      },
      "manager.dha@shay.salon": {
        id: "u-m-dha",
        email: "manager.dha@shay.salon",
        full_name: "Hamza Abbasi",
        system_role: "STAFF",
        branch_roles: [{ branch_id: "b2", role: "BRANCH_MANAGER" }],
      },
      "reception.clifton@shay.salon": {
        id: "u-r-clf",
        email: "reception.clifton@shay.salon",
        full_name: "Ayesha Khan",
        system_role: "STAFF",
        branch_roles: [{ branch_id: "b1", role: "RECEPTIONIST" }],
      },
      "reception.dha@shay.salon": {
        id: "u-r-dha",
        email: "reception.dha@shay.salon",
        full_name: "Hira Munir",
        system_role: "STAFF",
        branch_roles: [{ branch_id: "b2", role: "RECEPTIONIST" }],
      },
    };

    const userObj = roleMap[email] || {
      id: "u-demo",
      email: email || "owner@shay.salon",
      full_name: "Salon Manager",
      system_role: "BUSINESS_OWNER",
      branch_roles: [],
    };

    return NextResponse.json({
      access: `shay_cloud_jwt_${Date.now()}`,
      refresh: `shay_cloud_refresh_${Date.now()}`,
      user: userObj,
    });
  }

  // 2. Create Appointment / Walk-in
  if (path === "appointments" || path === "public/bookings") {
    const selectedSvc = services.find((s) => s.id === body.service_ids?.[0]) || services[0];
    const newAppt = {
      id: `app-${Date.now()}`,
      booking_reference: `SHAY-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: body.customer_name || "Walk-In Guest",
      customer_phone: body.customer_phone || "+92 300 0000000",
      customer_email: body.customer_email || "",
      service_names: [selectedSvc.name],
      staff_name: staffList.find((st) => st.id === body.staff_id)?.full_name || "Assigned Stylist",
      branch_name: branches.find((b) => b.id === body.branch_id)?.name || "Clifton Flagship Branch",
      branch_id: body.branch_id || "b1",
      start_time: body.start_time || new Date().toISOString(),
      status: "CONFIRMED",
      source: body.source || "WALK_IN",
      total_amount: selectedSvc.base_price,
    };
    appointments.unshift(newAppt);

    // Also auto-generate invoice
    const newInv = {
      id: `inv-${Date.now()}`,
      invoice_number: `SHAY-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: newAppt.customer_name,
      customer_phone: newAppt.customer_phone,
      branch_name: newAppt.branch_name,
      status: "ISSUED",
      subtotal_amount: selectedSvc.base_price,
      tax_amount: selectedSvc.base_price * 0.13,
      total_amount: selectedSvc.base_price * 1.13,
      amount_paid: 0,
      balance_due: selectedSvc.base_price * 1.13,
      issued_at: new Date().toISOString(),
      items: [
        { name: selectedSvc.name, quantity: 1, unit_price: selectedSvc.base_price, total_price: selectedSvc.base_price },
      ],
      payments: [],
    };
    invoices.unshift(newInv);

    return NextResponse.json(newAppt, { status: 201 });
  }

  // 3. Create Service / Deal
  if (path === "services") {
    const newSvc = {
      id: `s-${Date.now()}`,
      name: body.name || "Custom Signature Package",
      category: body.category || "Deals & Packages",
      base_price: parseFloat(body.base_price) || 5000,
      default_duration_minutes: parseInt(body.default_duration_minutes, 10) || 60,
      description: body.description || "",
      is_active: true,
      public_bookable: true,
    };
    services.unshift(newSvc);
    return NextResponse.json(newSvc, { status: 201 });
  }

  // 4. Record Payment on Invoice
  if (path.includes("payments")) {
    const invId = path.split("/")[2];
    const targetInv = invoices.find((inv) => inv.id === invId);
    if (targetInv) {
      targetInv.status = "PAID";
      targetInv.amount_paid = targetInv.total_amount;
      targetInv.balance_due = 0;
      targetInv.payments.push({
        method: body.method || "CASH",
        amount: body.amount || targetInv.total_amount,
        reference_code: body.reference_code || "TXN-PAID",
      });
    }
    return NextResponse.json({ status: "success", invoice: targetInv });
  }

  // 5. Record Stock Movement
  if (path === "inventory/movements") {
    return NextResponse.json({ status: "recorded" }, { status: 201 });
  }

  // 6. Appointment Status Update (Check in, In progress, Complete, Cancel)
  if (path.includes("appointments") && path.includes("status")) {
    const segments = path.split("/");
    const apptId = segments[1];
    const newStatus = body.status || "CONFIRMED";
    const appt = appointments.find((a) => a.id === apptId);
    if (appt) {
      appt.status = newStatus;
    }
    return NextResponse.json({ status: "success", appointment: appt });
  }

  // 7. Generate Invoice from Appointment (Checkout flow)
  if (path === "billing/invoices/from-appointment") {
    const appt = appointments.find((a) => a.id === body.appointment_id) || appointments[0];
    const inv = {
      id: `inv-${Date.now()}`,
      invoice_number: `SHAY-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: appt.customer_name,
      customer_phone: appt.customer_phone,
      branch_name: appt.branch_name,
      status: "ISSUED",
      subtotal_amount: appt.total_amount || 4500,
      tax_amount: (appt.total_amount || 4500) * 0.13,
      total_amount: (appt.total_amount || 4500) * 1.13,
      amount_paid: 0,
      balance_due: (appt.total_amount || 4500) * 1.13,
      issued_at: new Date().toISOString(),
      items: [
        { name: appt.service_names?.[0] || "Custom Salon Service", quantity: 1, unit_price: appt.total_amount, total_price: appt.total_amount },
      ],
      payments: [],
    };
    invoices.unshift(inv);
    return NextResponse.json(inv, { status: 201 });
  }

  // 8. Attendance Punch Simulator
  if (path.includes("attendance/punches") || path.includes("attendance/simulator") || path === "attendance/clock") {
    return NextResponse.json({
      status: "SUCCESS",
      punch_time: new Date().toISOString(),
      message: `Biometric Punch Recorded: ${body.punch_type || "CHECK_IN"} verified successfully.`,
    });
  }

  // 9. Payroll Run Generation & Disbursement
  if (path.includes("payroll/runs/generate")) {
    return NextResponse.json({
      status: "success",
      run_code: `PAY-2026-OCT-W${Math.floor(Math.random() * 4) + 1}`,
      message: "Biometric attendance draft payroll run generated.",
    });
  }

  if (path.includes("payroll/runs") && path.includes("disburse")) {
    return NextResponse.json({
      status: "success",
      message: "Payroll disbursed successfully via 1Link direct deposit.",
    });
  }

  // 10. WhatsApp Concierge Simulator Webhook
  if (path === "webhooks/whatsapp/simulate") {
    const rawMsg = (body.message || "").toLowerCase().trim();
    let reply = "";
    let nextState = "MENU";

    if (rawMsg.includes("hi") || rawMsg.includes("hello") || rawMsg.includes("menu")) {
      reply = "👋 Welcome to SHAY Salon & Spa (Karachi) WhatsApp Concierge!\n\n✨ Current Featured Specials:\n1️⃣ Executive Grooming Suite (Rs. 4,500)\n2️⃣ Hydra-Refresh & Hair Spa Ritual (Rs. 9,800)\n3️⃣ Royal Wedding Groom Package (Rs. 19,500)\n\nReply with Deal Number (e.g. 1) to book, or 'branch' for locations!";
      nextState = "AWAITING_SERVICE";
    } else if (rawMsg === "1" || rawMsg.includes("groom")) {
      reply = "✂️ Selected: SHAY Deal 01: Executive Grooming Suite (Precision Haircut + Organic Charcoal Beard + Scalp Cleanse).\n\nWhich branch would you like to visit?\n🅰️ Clifton Block 4 Flagship\n🅱️ DHA Phase 6 Bukhari Studio";
      nextState = "AWAITING_BRANCH";
    } else if (rawMsg === "2" || rawMsg.includes("hydra")) {
      reply = "💆‍♀️ Selected: SHAY Deal 02: Hydra-Refresh & Hair Spa Ritual (Deep Pore Hydra-Glow Facial + Moroccan Argan Gloss).\n\nWhich branch?\n🅰️ Clifton Block 4 Flagship\n🅱️ DHA Phase 6 Bukhari Studio";
      nextState = "AWAITING_BRANCH";
    } else if (rawMsg === "a" || rawMsg.includes("clifton")) {
      reply = "📍 Reserved at Clifton Flagship Branch (Block 4, Near Bilawal House).\n\nAvailable today at 02:00 PM with Senior Stylist Aliya Rizvi. Reply 'yes' to confirm your seat!";
      nextState = "AWAITING_CONFIRM";
    } else if (rawMsg === "b" || rawMsg.includes("dha")) {
      reply = "📍 Reserved at DHA Bukhari Studio (Bukhari Commercial Lane 3, Phase 6).\n\nAvailable today at 01:30 PM with Dr. Sana Hashmi. Reply 'yes' to confirm your seat!";
      nextState = "AWAITING_CONFIRM";
    } else if (rawMsg === "yes" || rawMsg.includes("confirm")) {
      reply = "🎉 Your booking is confirmed! Reference: SHAY-WA-9041.\n\nOur concierge will welcome you with complimentary refreshments. For directions, call +92 21 35870000.";
      nextState = "CONFIRMED";
    } else {
      reply = "Thank you for contacting SHAY Luxury Salon & Spa Karachi. How may our concierge team assist your appointment today? Type 'menu' to view packages.";
      nextState = "GREETING";
    }

    return NextResponse.json({
      session_state: nextState,
      bot_reply: reply,
    });
  }

  // 11. Add New Branch (with 20% discount structure)
  if (path === "branches" || path === "public/branches") {
    const newBr = {
      id: body.id || `b-${Date.now()}`,
      name: body.name || "New Salon Branch",
      code: body.code || `BR-0${branches.length + 1}`,
      city: body.city || "Karachi",
      address: body.address || "Karachi, Pakistan",
      phone: body.phone || "+92 21 35870000",
      email: body.email || "info@shay.salon",
      chairs: body.chairs || 6,
    };
    branches.push(newBr);
    return NextResponse.json(newBr, { status: 201 });
  }

  return NextResponse.json({ status: "ok" });
}
