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
  {
    id: "s1",
    name: "SHAY Deal 01: Executive Grooming Suite",
    category: "Deals & Packages",
    base_price: 4500,
    default_duration_minutes: 60,
    description: "Signature Precision Haircut + Organic Charcoal Beard Sculpting + Rejuvenating Scalp Cleanse + Hot Towel Refreshment. (Valued at Rs. 6,500 · Save 31%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "s2",
    name: "SHAY Deal 02: Hydra-Refresh & Hair Spa Ritual",
    category: "Deals & Packages",
    base_price: 9800,
    default_duration_minutes: 90,
    description: "Deep Pore Hydra-Glow Facial + Restorative Scalp Ritual & Hair Spa Mask + Neck & Shoulder Tension Release + Moroccan Argan Gloss. (Valued at Rs. 15,000 · Save 35%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "s3",
    name: "SHAY Deal 03: Royal Wedding Groom Package",
    category: "Wedding & Groom Packages",
    base_price: 19500,
    default_duration_minutes: 150,
    description: "Complete Wedding Day Perfection: Signature Luxury Haircut & Styling + 24k Gold Infusion Facial + Hand & Foot Paraffin Reflexology Spa + Beard Architecture & Pre-Shoot Mattifying Glow. (Valued at Rs. 28,000 · Save 30%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "s4",
    name: "SHAY Deal 04: Pure Silk Keratin & Makeover",
    category: "Deals & Packages",
    base_price: 22000,
    default_duration_minutes: 180,
    description: "Formaldehyde-Free Pure Silk Keratin Treatment + Split-End Pruning & Thermal Styling + Take-Home Post-Care Serum. (Valued at Rs. 29,500 · Save 25%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "s5",
    name: "SHAY Deal 05: Gentleman's Quick Reset",
    category: "Deals & Packages",
    base_price: 3200,
    default_duration_minutes: 45,
    description: "Fast Executive Haircut + Beard Lineup & Oil Treatment + Cooling Mint Facial Cleanse. (Valued at Rs. 4,500 · Save 29%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "s6",
    name: "SHAY Deal 06: Deluxe Spa Mani-Pedi & Head Therapy",
    category: "Deals & Packages",
    base_price: 5500,
    default_duration_minutes: 75,
    description: "Therapeutic Herbal Manicure & Pedicure + Dead Sea Salt Scrub + 20-min Indian Ayurvedic Scalp Massage. (Valued at Rs. 8,000 · Save 31%)",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "s7",
    name: "Signature Precision Haircut & Styling",
    category: "Hair Services",
    base_price: 3500,
    default_duration_minutes: 45,
    description: "Consultation, custom scissor cut, wash, and luxury finish.",
    is_active: true,
    public_bookable: true,
  },
  {
    id: "s8",
    name: "Hydra-Glow Luxury Facial",
    category: "Esthetics & Skincare",
    base_price: 9500,
    default_duration_minutes: 75,
    description: "7-step deep cleansing, micro-exfoliation, serum infusion.",
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
  const path = params.slug.join("/");

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

  // 3. Staff
  if (path === "staff") {
    return NextResponse.json(staffList);
  }

  // 4. Dashboard Summary
  if (path === "dashboard/summary") {
    const totalRev = appointments.reduce((sum, a) => sum + (Number(a.total_amount) || 0), 142500);
    return NextResponse.json({
      metrics: {
        today_appointments: appointments.length || 24,
        today_confirmed: 16,
        today_completed: 8,
        active_staff_count: 8,
        today_revenue: totalRev,
        upcoming_appointments: 18,
      },
      recent_appointments: appointments,
    });
  }

  // 5. Appointments
  if (path === "appointments") {
    return NextResponse.json(appointments);
  }

  // 6. Invoices
  if (path === "billing/invoices") {
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
    return NextResponse.json({
      date: new Date().toISOString().split("T")[0],
      total_sales: 142500,
      cash_sales: 45000,
      card_sales: 97500,
      tax_collected: 18525, // 13% SRB
      staff_commissions: 21375,
      total_invoices: invoices.length,
      appointments_served: 24,
    });
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

  return NextResponse.json({ status: "ok" });
}
