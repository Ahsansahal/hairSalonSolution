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

  return NextResponse.json({ status: "ok" });
}
