// backend/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs/promises";

// Lazy load pdf-parse only when needed (to avoid DOMMatrix error on startup)
let pdfParse: any = null;
async function getPdfParse() {
  if (!pdfParse) {
    try {
      // @ts-ignore - pdf-parse doesn't have proper TypeScript definitions
      pdfParse = require("pdf-parse");
    } catch (error) {
      console.warn("pdf-parse not available, PDF uploads will be limited");
    }
  }
  return pdfParse;
}

dotenv.config();

const app = express();

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed"));
    }
  },
});

// Ensure uploads directory exists
(async () => {
  try {
    await fs.mkdir("uploads", { recursive: true });
  } catch (error) {
    // Directory already exists
  }
})();

// --- Middleware ---
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Types ---
type WarrantyStatus = "active" | "expiring_soon" | "expired";

type Warranty = {
  id: number;
  product_name: string;
  category?: string;
  serial_number?: string;
  supplier?: string;

  purchase_date: string; // YYYY-MM-DD
  warranty_start: string; // YYYY-MM-DD
  warranty_end: string; // YYYY-MM-DD

  warranty_length_months?: number;
  purchase_cost?: number;

  status: WarrantyStatus;

  claim_filed: boolean;
  claim_date?: string;
  claim_amount?: number;

  notes?: string;
  invoice_url?: string;

  created_at: string; // ISO
};

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

// --- Helpers ---
function parseISODate(d: string): Date | null {
  if (!d || typeof d !== 'string') return null;
  
  // Try YYYY-MM-DD format first (standard ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const date = new Date(`${d}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  
  // Try MM/DD/YYYY format (common US format)
  const mmddyyyy = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  
  // Try DD/MM/YYYY format
  const ddmmyyyy = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  
  // Try parsing as-is (might include time)
  const date = new Date(d);
  if (!Number.isNaN(date.getTime())) {
    // Extract just the date part
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }
  
  return null;
}

function formatDateYYYYMMDD(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function computeStatus(warrantyEnd: Date, now: Date, expiringDays = 30): WarrantyStatus {
  const diff = daysBetween(now, warrantyEnd);
  if (diff < 0) return "expired";
  if (diff <= expiringDays) return "expiring_soon";
  return "active";
}

function compactWarranty(w: Warranty) {
  return {
    id: w.id,
    product_name: w.product_name,
    category: w.category,
    supplier: w.supplier,
    serial_number: w.serial_number,
    warranty_end: w.warranty_end,
    status: w.status,
  };
}

// --- In-memory "DB" ---
let nextId = 1;
const warranties: Warranty[] = [];

// Seed deterministic demo data
function seedData() {
  if (warranties.length > 0) return;

  const now = new Date();
  const today = formatDateYYYYMMDD(now);

  function addSeed(partial: Omit<Warranty, "id" | "created_at" | "status"> & { status?: WarrantyStatus }) {
    const endDate = parseISODate(partial.warranty_end);
    const computed = endDate ? computeStatus(endDate, now, 30) : "active";
    const w: Warranty = {
      id: nextId++,
      created_at: new Date().toISOString(),
      status: partial.status ?? computed,
      ...partial,
    };
    warranties.push(w);
  }

  // A few expiring soon (within ~30 days)
  const expSoon1 = new Date(now.getTime() + 10 * 24 * 3600 * 1000);
  const expSoon2 = new Date(now.getTime() + 21 * 24 * 3600 * 1000);
  const expSoon3 = new Date(now.getTime() + 29 * 24 * 3600 * 1000);

  // A couple expired
  const expired1 = new Date(now.getTime() - 40 * 24 * 3600 * 1000);
  const expired2 = new Date(now.getTime() - 5 * 24 * 3600 * 1000);

  addSeed({
    product_name: "Toyota 8FGU25 Forklift",
    category: "Material Handling",
    serial_number: "FKL-2024-001",
    supplier: "Grainger",
    purchase_date: "2023-06-15",
    warranty_start: "2023-06-15",
    warranty_end: formatDateYYYYMMDD(expSoon1),
    warranty_length_months: 36,
    purchase_cost: 28000,
    claim_filed: false,
    notes: "Annual maintenance recommended.",
    invoice_url: "",
  });

  addSeed({
    product_name: "Carrier 50TC 10-Ton HVAC Unit",
    category: "HVAC",
    serial_number: "HVAC-2022-445",
    supplier: "Grainger",
    purchase_date: "2022-03-10",
    warranty_start: "2022-03-10",
    warranty_end: formatDateYYYYMMDD(expSoon2),
    warranty_length_months: 48,
    purchase_cost: 12500,
    claim_filed: false,
    notes: "Filter replacements quarterly.",
    invoice_url: "",
  });

  addSeed({
    product_name: "Generac 150kW Diesel Generator",
    category: "Power Generation",
    serial_number: "GEN-2021-889",
    supplier: "Grainger",
    purchase_date: "2021-11-20",
    warranty_start: "2021-11-20",
    warranty_end: formatDateYYYYMMDD(expSoon3),
    warranty_length_months: 60,
    purchase_cost: 45000,
    claim_filed: true,
    claim_date: today,
    claim_amount: 3200,
    notes: "Claim filed for starter motor replacement.",
    invoice_url: "",
  });

  addSeed({
    product_name: "Ingersoll Rand Air Compressor (15HP)",
    category: "Compressed Air",
    serial_number: "COMP-2019-113",
    supplier: "Fastenal",
    purchase_date: "2019-02-01",
    warranty_start: "2019-02-01",
    warranty_end: formatDateYYYYMMDD(expired1),
    warranty_length_months: 24,
    purchase_cost: 8900,
    claim_filed: false,
    notes: "Expired; consider extended service plan.",
    invoice_url: "",
  });

  addSeed({
    product_name: "Honeywell Barcode Scanner",
    category: "IT/Devices",
    serial_number: "SCN-2024-772",
    supplier: "CDW",
    purchase_date: "2024-08-05",
    warranty_start: "2024-08-05",
    warranty_end: formatDateYYYYMMDD(expired2),
    warranty_length_months: 12,
    purchase_cost: 399,
    claim_filed: false,
    notes: "Returned once for calibration.",
    invoice_url: "",
  });

  // Additional hardcoded products for better analytics
  const active1 = new Date(now.getTime() + 120 * 24 * 3600 * 1000); // 120 days
  const active2 = new Date(now.getTime() + 200 * 24 * 3600 * 1000); // 200 days
  const active3 = new Date(now.getTime() + 365 * 24 * 3600 * 1000); // 1 year
  const active4 = new Date(now.getTime() + 180 * 24 * 3600 * 1000); // 180 days
  const active5 = new Date(now.getTime() + 250 * 24 * 3600 * 1000); // 250 days
  const active6 = new Date(now.getTime() + 90 * 24 * 3600 * 1000);  // 90 days
  const active7 = new Date(now.getTime() + 300 * 24 * 3600 * 1000); // 300 days

  addSeed({
    product_name: "Milwaukee M18 Fuel Drill Kit",
    category: "Power Tools",
    serial_number: "MIL-2024-156",
    supplier: "Grainger",
    purchase_date: "2024-03-20",
    warranty_start: "2024-03-20",
    warranty_end: formatDateYYYYMMDD(active1),
    warranty_length_months: 24,
    purchase_cost: 249.99,
    claim_filed: false,
    notes: "Heavy-duty construction tool.",
    invoice_url: "",
  });

  addSeed({
    product_name: "3M Safety Goggles (Bulk Pack)",
    category: "Safety",
    serial_number: "3M-SAF-2024-089",
    supplier: "Grainger",
    purchase_date: "2024-05-10",
    warranty_start: "2024-05-10",
    warranty_end: formatDateYYYYMMDD(active2),
    warranty_length_months: 12,
    purchase_cost: 125.50,
    claim_filed: false,
    notes: "50-pack for warehouse team.",
    invoice_url: "",
  });

  addSeed({
    product_name: "LED High Bay Light Fixture (150W)",
    category: "Lighting",
    serial_number: "LED-2023-442",
    supplier: "Grainger",
    purchase_date: "2023-09-15",
    warranty_start: "2023-09-15",
    warranty_end: formatDateYYYYMMDD(active3),
    warranty_length_months: 60,
    purchase_cost: 189.99,
    claim_filed: false,
    notes: "Energy-efficient warehouse lighting.",
    invoice_url: "",
  });

  addSeed({
    product_name: "Dewalt Table Saw (10-inch)",
    category: "Power Tools",
    serial_number: "DWT-2024-223",
    supplier: "Fastenal",
    purchase_date: "2024-06-01",
    warranty_start: "2024-06-01",
    warranty_end: formatDateYYYYMMDD(active4),
    warranty_length_months: 36,
    purchase_cost: 599.00,
    claim_filed: false,
    notes: "Workshop equipment.",
    invoice_url: "",
  });

  addSeed({
    product_name: "Industrial Shop Vacuum (16 Gallon)",
    category: "Cleaning Equipment",
    serial_number: "VAC-2024-334",
    supplier: "Grainger",
    purchase_date: "2024-04-12",
    warranty_start: "2024-04-12",
    warranty_end: formatDateYYYYMMDD(active5),
    warranty_length_months: 24,
    purchase_cost: 329.99,
    claim_filed: false,
    notes: "Heavy-duty cleaning system.",
    invoice_url: "",
  });

  addSeed({
    product_name: "Bosch Angle Grinder (4.5 inch)",
    category: "Power Tools",
    serial_number: "BOS-2024-667",
    supplier: "MSC",
    purchase_date: "2024-07-18",
    warranty_start: "2024-07-18",
    warranty_end: formatDateYYYYMMDD(active6),
    warranty_length_months: 12,
    purchase_cost: 89.99,
    claim_filed: false,
    notes: "Metalworking tool.",
    invoice_url: "",
  });

  addSeed({
    product_name: "Yale Electric Pallet Jack",
    category: "Material Handling",
    serial_number: "YAL-2023-778",
    supplier: "Grainger",
    purchase_date: "2023-11-05",
    warranty_start: "2023-11-05",
    warranty_end: formatDateYYYYMMDD(active7),
    warranty_length_months: 36,
    purchase_cost: 4200.00,
    claim_filed: true,
    claim_date: "2024-10-15",
    claim_amount: 450.00,
    notes: "Claim filed for battery replacement.",
    invoice_url: "",
  });
}

seedData();

// Refresh status on every read (so “expiring soon” stays accurate during demo)
function refreshStatuses(expiringDays = 30) {
  const now = new Date();
  for (const w of warranties) {
    const end = parseISODate(w.warranty_end);
    if (!end) continue;
    w.status = computeStatus(end, now, expiringDays);
  }
}

// --- Routes ---
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "warrantywizard-backend" });
});

/**
 * GET /api/warranties
 * Optional query params:
 *  - status=active|expiring_soon|expired
 *  - q=search string (product_name, serial_number, supplier, category)
 */
app.get("/api/warranties", (req: Request, res: Response) => {
  refreshStatuses(30);

  const status = (req.query.status as string | undefined) as WarrantyStatus | undefined;
  const q = (req.query.q as string | undefined)?.trim().toLowerCase();

  let results = [...warranties];

  if (status) results = results.filter((w) => w.status === status);

  if (q) {
    results = results.filter((w) => {
      const hay = `${w.product_name} ${w.serial_number ?? ""} ${w.supplier ?? ""} ${w.category ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  res.json({ count: results.length, warranties: results });
});

/**
 * GET /api/warranties/expiring?days=30
 */
app.get("/api/warranties/expiring", (req: Request, res: Response) => {
  const days = Number(req.query.days ?? 30);
  const expiringDays = Number.isFinite(days) && days > 0 ? days : 30;

  refreshStatuses(expiringDays);

  const now = new Date();
  const expiring = warranties
    .filter((w) => w.status === "expiring_soon")
    .map((w) => {
      const end = parseISODate(w.warranty_end)!;
      return { ...w, days_until_expiry: daysBetween(now, end) };
    })
    .sort((a, b) => a.days_until_expiry - b.days_until_expiry);

  res.json({ count: expiring.length, days: expiringDays, warranties: expiring });
});

/**
 * POST /api/warranties
 * Body: basic warranty info
 */
app.post("/api/warranties", (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    console.log('Received warranty creation request:', JSON.stringify(body, null, 2));

    const required = ["product_name", "purchase_date", "warranty_end"] as const;
    for (const key of required) {
      if (!body[key] || typeof body[key] !== "string") {
        console.error(`Missing/invalid field: ${key}`, body[key]);
        return res.status(400).json({ error: `Missing/invalid field: ${key}` });
      }
    }

    // Clean date strings (remove time portion if present)
    const purchaseDateStr = String(body.purchase_date).split('T')[0].trim();
    const warrantyEndStr = String(body.warranty_end).split('T')[0].trim();

    console.log('Parsing dates:', { purchaseDateStr, warrantyEndStr });

    const purchaseDate = parseISODate(purchaseDateStr);
    const warrantyEnd = parseISODate(warrantyEndStr);
    const warrantyStart = body.warranty_start ? parseISODate(String(body.warranty_start).split('T')[0].trim()) : purchaseDate;

    if (!purchaseDate) {
      console.error('Failed to parse purchase_date:', purchaseDateStr);
      return res.status(400).json({ error: `Invalid purchase_date format. Received: "${body.purchase_date}" (cleaned: "${purchaseDateStr}"). Expected YYYY-MM-DD format.` });
    }
    if (!warrantyEnd) {
      console.error('Failed to parse warranty_end:', warrantyEndStr);
      return res.status(400).json({ error: `Invalid warranty_end format. Received: "${body.warranty_end}" (cleaned: "${warrantyEndStr}"). Expected YYYY-MM-DD format.` });
    }
    if (!warrantyStart) {
      console.error('Failed to parse warranty_start');
      return res.status(400).json({ error: "warranty_start must be YYYY-MM-DD" });
    }

    const now = new Date();
    const status = computeStatus(warrantyEnd, now, 30);

    const w: Warranty = {
      id: nextId++,
      product_name: String(body.product_name),
      category: body.category ? String(body.category) : undefined,
      serial_number: body.serial_number ? String(body.serial_number) : undefined,
      supplier: body.supplier ? String(body.supplier) : undefined,
      purchase_date: formatDateYYYYMMDD(purchaseDate),
      warranty_start: formatDateYYYYMMDD(warrantyStart),
      warranty_end: formatDateYYYYMMDD(warrantyEnd),
      warranty_length_months: body.warranty_length_months ? Number(body.warranty_length_months) : undefined,
      purchase_cost: body.purchase_cost ? Number(body.purchase_cost) : undefined,
      status,
      claim_filed: Boolean(body.claim_filed ?? false),
      claim_date: body.claim_date ? String(body.claim_date) : undefined,
      claim_amount: body.claim_amount ? Number(body.claim_amount) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      invoice_url: body.invoice_url ? String(body.invoice_url) : undefined,
      created_at: new Date().toISOString(),
    };

    warranties.unshift(w);
    console.log('Warranty created successfully:', w.id, w.product_name);
    res.status(201).json({ warranty: w });
  } catch (error: any) {
    console.error('Error creating warranty:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: error.message || "Failed to create warranty",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/analytics
 * Very simple metrics for demo
 */
app.get("/api/analytics", (_req: Request, res: Response) => {
  refreshStatuses(30);

  const total = warranties.length;
  const active = warranties.filter((w) => w.status === "active").length;
  const expiring = warranties.filter((w) => w.status === "expiring_soon").length;
  const expired = warranties.filter((w) => w.status === "expired").length;

  const claimsFiled = warranties.filter((w) => w.claim_filed).length;
  const claimAmount = warranties.reduce((sum, w) => sum + (w.claim_amount ?? 0), 0);

  const coverageValue = warranties.reduce((sum, w) => sum + (w.purchase_cost ?? 0), 0);

  res.json({
    totals: { total, active, expiring, expired },
    claims: { filed: claimsFiled, total_claim_amount: claimAmount },
    estimated: { coverage_value: coverageValue },
  });
});

/**
 * POST /api/ai-chat
 * Enhanced AI chatbot with better context and responses
 * Body:
 *  - message: string
 *  - conversationHistory?: ChatMessage[]
 */
app.post("/api/ai-chat", (req: Request, res: Response) => {
  refreshStatuses(30);

  const message = String(req.body?.message ?? "").trim();
  if (!message) return res.status(400).json({ error: "message is required" });

  const msgLower = message.toLowerCase();
  const now = new Date();
  const active = warranties.filter((w) => w.status === "active");
  const expiring = warranties.filter((w) => w.status === "expiring_soon");
  const expired = warranties.filter((w) => w.status === "expired");
  const totalValue = warranties.reduce((sum, w) => sum + (w.purchase_cost || 0), 0);

  // Expiration queries
  if (msgLower.includes("expire") || msgLower.includes("expir") || msgLower.includes("expiring")) {
    let days = 30;
    if (msgLower.includes("next month") || msgLower.includes("30")) days = 30;
    else if (msgLower.includes("next week") || msgLower.includes("7")) days = 7;
    else if (msgLower.includes("60") || msgLower.includes("2 months")) days = 60;
    else if (msgLower.includes("90") || msgLower.includes("3 months")) days = 90;

    const expiringItems = warranties
      .map((w) => ({ w, end: parseISODate(w.warranty_end) }))
      .filter((x) => x.end !== null)
      .map((x) => ({ ...x, days_until: daysBetween(now, x.end as Date) }))
      .filter((x) => x.days_until >= 0 && x.days_until <= days)
      .sort((a, b) => a.days_until - b.days_until);

    if (expiringItems.length === 0) {
      return res.json({
        reply: `✅ Great news! I don't see any warranties expiring in the next ${days} days. All your equipment coverage is secure.`,
        data: { expiring: [] },
      });
    }

    const lines = expiringItems.map((x) => {
      const daysLeft = x.days_until;
      const urgency = daysLeft <= 7 ? "🚨 URGENT" : daysLeft <= 14 ? "⚠️ Soon" : "📅";
      return `${urgency} ${x.w.product_name} - Expires in ${daysLeft} days (${x.w.warranty_end})`;
    });

    const totalValueExpiring = expiringItems.reduce((sum, x) => sum + (x.w.purchase_cost || 0), 0);
    
    return res.json({
      reply: `⚠️ You have ${expiringItems.length} warranty(ies) expiring in the next ${days} days:\n\n${lines.join("\n")}\n\n💡 **Action Required:** These warranties cover approximately $${totalValueExpiring.toLocaleString()} in equipment. I recommend reviewing these items and considering extended warranties if needed.`,
      data: { expiring: expiringItems.map((x) => compactWarranty(x.w)) },
    });
  }

  // Claim filing queries
  if (msgLower.includes("claim") || msgLower.includes("file") || msgLower.includes("warranty claim")) {
    const productMatch = warranties.find(w => 
      msgLower.includes(w.product_name.toLowerCase().split(' ')[0])
    );

    if (productMatch) {
      return res.json({
        reply: `📋 For **${productMatch.product_name}**:\n\n` +
          `1. **Status:** ${productMatch.status === 'active' ? '✅ Active' : '⚠️ ' + productMatch.status}\n` +
          `2. **Serial Number:** ${productMatch.serial_number || 'Not recorded'}\n` +
          `3. **Supplier:** ${productMatch.supplier || 'Not recorded'}\n` +
          `4. **Warranty End:** ${productMatch.warranty_end}\n\n` +
          `**Next Steps:**\n` +
          `- Contact ${productMatch.supplier || 'the supplier'} with your serial number\n` +
          `- Have your purchase invoice ready\n` +
          `- Describe the issue clearly\n` +
          `- File the claim before ${productMatch.warranty_end}`
      });
    }

    return res.json({
      reply: `📋 **How to File a Warranty Claim:**\n\n` +
        `1. **Identify the Item** - Find the equipment in your warranty list\n` +
        `2. **Verify Coverage** - Ensure the warranty is still active\n` +
        `3. **Gather Documents** - Collect invoice, serial number, and photos of the issue\n` +
        `4. **Contact Supplier** - Reach out to Grainger or the manufacturer\n` +
        `5. **Document Everything** - Record claim number, date, and amount\n\n` +
        `💡 **Tip:** Tell me the product name and I can provide specific details for that item.`,
    });
  }

  // Analytics queries
  if (msgLower.includes("how many") || msgLower.includes("count") || msgLower.includes("total")) {
    if (msgLower.includes("active")) {
      return res.json({
        reply: `✅ You currently have **${active.length} active warranties** covering $${active.reduce((sum, w) => sum + (w.purchase_cost || 0), 0).toLocaleString()} in equipment.`,
      });
    }
    if (msgLower.includes("expir") || msgLower.includes("expiring")) {
      return res.json({
        reply: `⚠️ You have **${expiring.length} warranties expiring soon** that need attention.`,
      });
    }
    if (msgLower.includes("expired")) {
      return res.json({
        reply: `❌ You have **${expired.length} expired warranties**. These items are no longer covered and may need extended service plans.`,
      });
    }
    return res.json({
      reply: `📊 **Your Warranty Overview:**\n\n` +
        `- **Total Warranties:** ${warranties.length}\n` +
        `- **Active:** ${active.length}\n` +
        `- **Expiring Soon:** ${expiring.length}\n` +
        `- **Expired:** ${expired.length}\n` +
        `- **Total Coverage Value:** $${totalValue.toLocaleString()}`,
    });
  }

  // Cost/savings queries
  if (msgLower.includes("cost") || msgLower.includes("save") || msgLower.includes("value") || msgLower.includes("worth")) {
    const claimsValue = warranties.filter(w => w.claim_filed).reduce((sum, w) => sum + (w.claim_amount || 0), 0);
    return res.json({
      reply: `💰 **Financial Overview:**\n\n` +
        `- **Total Coverage Value:** $${totalValue.toLocaleString()}\n` +
        `- **Claims Filed:** $${claimsValue.toLocaleString()}\n` +
        `- **Active Warranties Value:** $${active.reduce((sum, w) => sum + (w.purchase_cost || 0), 0).toLocaleString()}\n\n` +
        `💡 By tracking warranties proactively, you're protecting significant equipment investments!`,
    });
  }

  // Search for specific product
  const productKeywords = warranties.map(w => w.product_name.toLowerCase().split(' ')).flat();
  const matchedProduct = warranties.find(w => 
    w.product_name.toLowerCase().split(' ').some(word => msgLower.includes(word))
  );

  if (matchedProduct) {
    const endDate = parseISODate(matchedProduct.warranty_end);
    const daysLeft = endDate ? daysBetween(now, endDate) : null;
    return res.json({
      reply: `🔍 **${matchedProduct.product_name}**\n\n` +
        `- **Category:** ${matchedProduct.category || 'Not specified'}\n` +
        `- **Serial Number:** ${matchedProduct.serial_number || 'Not recorded'}\n` +
        `- **Supplier:** ${matchedProduct.supplier || 'Not specified'}\n` +
        `- **Status:** ${matchedProduct.status === 'active' ? '✅ Active' : matchedProduct.status === 'expiring_soon' ? '⚠️ Expiring Soon' : '❌ Expired'}\n` +
        `- **Warranty End:** ${matchedProduct.warranty_end}${daysLeft !== null ? ` (${daysLeft} days remaining)` : ''}\n` +
        `- **Purchase Cost:** ${matchedProduct.purchase_cost ? '$' + matchedProduct.purchase_cost.toLocaleString() : 'Not recorded'}\n` +
        `${matchedProduct.notes ? `- **Notes:** ${matchedProduct.notes}` : ''}`,
    });
  }

  // Help/default
  return res.json({
    reply: `👋 **I'm your WarrantyWizard AI Assistant, powered by Grainger!**\n\n` +
      `I can help you with:\n\n` +
      `🔍 **Find Information:**\n` +
      `- "Which items expire next month?"\n` +
      `- "How many active warranties do I have?"\n` +
      `- "Tell me about [product name]"\n\n` +
      `📋 **Claims & Support:**\n` +
      `- "How do I file a claim?"\n` +
      `- "File claim for [product]"\n\n` +
      `💰 **Analytics:**\n` +
      `- "What's my total coverage value?"\n` +
      `- "Show me cost savings"\n\n` +
      `💡 Try asking me anything about your warranties!`,
  });
});

// Helper functions for PDF text extraction
function extractField(text: string, keywords: string[]): string | undefined {
  const lowerText = text.toLowerCase();
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[\\s:]+([^\\n\\r]+)`, "i");
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

function extractDate(text: string): string | undefined {
  const dateRegex = /(\d{4}[-/]\d{1,2}[-/]\d{1,2})|(\d{1,2}[-/]\d{1,2}[-/]\d{4})/;
  const match = text.match(dateRegex);
  if (match) {
    return match[0].replace(/\//g, "-");
  }
  return undefined;
}

function extractWarrantyPeriod(text: string): number | undefined {
  const regex = /(\d+)\s*(month|year|mo|yr)/i;
  const match = text.match(regex);
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith("year") || unit.startsWith("yr")) {
      return num * 12;
    }
    return num;
  }
  return undefined;
}

function extractCost(text: string): number | undefined {
  const regex = /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
  const match = text.match(regex);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ""));
  }
  return undefined;
}

/**
 * POST /api/upload/invoice
 * Upload PDF invoice and extract warranty information
 */
app.post("/api/upload/invoice", upload.single("invoice"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    let extractedText = "";

    // Extract text from PDF
    if (file.mimetype === "application/pdf") {
      const pdfParser = await getPdfParse();
      if (pdfParser) {
        try {
          const dataBuffer = await fs.readFile(file.path);
          const pdfData = await pdfParser(dataBuffer);
          extractedText = pdfData.text;
        } catch (parseError) {
          console.error("PDF parsing error:", parseError);
          extractedText = "Failed to parse PDF. Please use manual entry.";
        }
      } else {
        extractedText = "PDF parsing not available. Please use manual entry.";
      }
    } else {
      // For images, simulate OCR (in production, use Tesseract or Google Vision)
      extractedText = "Simulated invoice text from image. Product: Sample Equipment, Date: 2024-01-15, Warranty: 24 months, Cost: $1,500";
    }

    // Simple extraction (in production, use AI/ML)
    const extractedData = {
      product_name: extractField(extractedText, ["product", "item", "equipment"]),
      purchase_date: extractDate(extractedText),
      warranty_length_months: extractWarrantyPeriod(extractedText),
      purchase_cost: extractCost(extractedText),
      supplier: extractField(extractedText, ["supplier", "vendor", "grainger"]),
      serial_number: extractField(extractedText, ["serial", "sn", "model"]),
    };

    // Clean up uploaded file
    await fs.unlink(file.path).catch(() => {});

    res.json({
      success: true,
      message: "Invoice processed successfully",
      data: {
        extracted_text: extractedText.substring(0, 500),
        warranty_data: extractedData,
      },
    });
  } catch (error: any) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process invoice",
    });
  }
});

/**
 * POST /api/upload/invoice/create
 * Upload PDF and automatically create warranty
 */
app.post("/api/upload/invoice/create", upload.single("invoice"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    let extractedText = "";

    if (file.mimetype === "application/pdf") {
      const pdfParser = await getPdfParse();
      if (pdfParser) {
        try {
          const dataBuffer = await fs.readFile(file.path);
          const pdfData = await pdfParser(dataBuffer);
          extractedText = pdfData.text;
        } catch (parseError) {
          console.error("PDF parsing error:", parseError);
          extractedText = "Failed to parse PDF. Please use manual entry.";
        }
      } else {
        extractedText = "PDF parsing not available. Please use manual entry.";
      }
    } else {
      extractedText = "Simulated invoice text";
    }

    // Extract data
    const extractedData: any = {
      product_name: extractField(extractedText, ["product", "item", "equipment"]) || "Equipment from Invoice",
      purchase_date: extractDate(extractedText) || formatDateYYYYMMDD(new Date()),
      warranty_length_months: extractWarrantyPeriod(extractedText) || 24,
      purchase_cost: extractCost(extractedText),
      supplier: extractField(extractedText, ["supplier", "vendor", "grainger"]) || "Grainger",
      serial_number: extractField(extractedText, ["serial", "sn", "model"]),
    };

    // Calculate warranty end date
    if (extractedData.purchase_date && extractedData.warranty_length_months) {
      const purchaseDate = parseISODate(extractedData.purchase_date);
      if (purchaseDate) {
        const warrantyEnd = new Date(purchaseDate);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + extractedData.warranty_length_months);
        extractedData.warranty_start = extractedData.purchase_date;
        extractedData.warranty_end = formatDateYYYYMMDD(warrantyEnd);
      }
    } else {
      // Default to 1 year from today
      const today = new Date();
      extractedData.purchase_date = formatDateYYYYMMDD(today);
      extractedData.warranty_start = extractedData.purchase_date;
      const endDate = new Date(today);
      endDate.setFullYear(endDate.getFullYear() + 1);
      extractedData.warranty_end = formatDateYYYYMMDD(endDate);
    }

    // Create warranty
    const now = new Date();
    const warrantyEnd = parseISODate(extractedData.warranty_end);
    const status = warrantyEnd ? computeStatus(warrantyEnd, now, 30) : "active";

    const warranty: Warranty = {
      id: nextId++,
      product_name: extractedData.product_name,
      category: extractedData.category,
      serial_number: extractedData.serial_number,
      supplier: extractedData.supplier,
      purchase_date: extractedData.purchase_date,
      warranty_start: extractedData.warranty_start,
      warranty_end: extractedData.warranty_end,
      warranty_length_months: extractedData.warranty_length_months,
      purchase_cost: extractedData.purchase_cost,
      status,
      claim_filed: false,
      created_at: new Date().toISOString(),
    };

    warranties.unshift(warranty);

    // Clean up file
    await fs.unlink(file.path).catch(() => {});

    res.json({
      success: true,
      message: "Invoice processed and warranty created successfully",
      warranty,
    });
  } catch (error: any) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process invoice",
    });
  }
});

// --- Start ---
const port = Number(process.env.PORT ?? 3001);

// Verify seed data was loaded
console.log(`\n📦 Loaded ${warranties.length} warranty products from seed data\n`);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`✅ WarrantyWizard backend running on http://localhost:${port}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   GET  http://localhost:${port}/api/warranties`);
  console.log(`   GET  http://localhost:${port}/api/analytics`);
  console.log(`   GET  http://localhost:${port}/api/warranties/expiring`);
  console.log(`   POST http://localhost:${port}/api/warranties`);
  console.log(`   POST http://localhost:${port}/api/ai-chat`);
  console.log(`\n🎯 Ready to serve ${warranties.length} warranties!\n`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use. Please stop the other process or use a different port.`);
  } else {
    console.error('❌ Failed to start server:', err);
  }
  process.exit(1);
});
