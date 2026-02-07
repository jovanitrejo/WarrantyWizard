// backend/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

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
  // Expect YYYY-MM-DD (no time)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const date = new Date(`${d}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
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

  // Fill out to ~20 items for a nicer dashboard
  const categories = ["HVAC", "Material Handling", "Power Tools", "IT/Devices", "Safety", "Lighting"];
  const suppliers = ["Grainger", "Fastenal", "Uline", "CDW", "MSC"];
  for (let i = 0; i < 15; i++) {
    const daysOut = 60 + i * 7;
    const end = new Date(now.getTime() + daysOut * 24 * 3600 * 1000);
    addSeed({
      product_name: `Equipment Item ${i + 1}`,
      category: categories[i % categories.length],
      serial_number: `SN-${1000 + i}`,
      supplier: suppliers[i % suppliers.length],
      purchase_date: "2024-01-15",
      warranty_start: "2024-01-15",
      warranty_end: formatDateYYYYMMDD(end),
      warranty_length_months: 24,
      purchase_cost: 500 + i * 75,
      claim_filed: false,
      notes: "",
      invoice_url: "",
    });
  }
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
  const body = req.body ?? {};

  const required = ["product_name", "purchase_date", "warranty_end"] as const;
  for (const key of required) {
    if (!body[key] || typeof body[key] !== "string") {
      return res.status(400).json({ error: `Missing/invalid field: ${key}` });
    }
  }

  const purchaseDate = parseISODate(body.purchase_date);
  const warrantyEnd = parseISODate(body.warranty_end);
  const warrantyStart = body.warranty_start ? parseISODate(body.warranty_start) : purchaseDate;

  if (!purchaseDate) return res.status(400).json({ error: "purchase_date must be YYYY-MM-DD" });
  if (!warrantyEnd) return res.status(400).json({ error: "warranty_end must be YYYY-MM-DD" });
  if (!warrantyStart) return res.status(400).json({ error: "warranty_start must be YYYY-MM-DD" });

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
  res.status(201).json({ warranty: w });
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
 * Hackathon-friendly: rule-based “smart” answers so your demo works without keys.
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

  // Very simple intent handling
  if (msgLower.includes("expire") || msgLower.includes("expir")) {
    // Determine "next month" / "30 days" rough intent
    const days =
      msgLower.includes("next month") || msgLower.includes("30") ? 30 :
      msgLower.includes("7") ? 7 :
      30;

    const expiring = warranties
      .map((w) => ({ w, end: parseISODate(w.warranty_end) }))
      .filter((x) => x.end !== null)
      .map((x) => ({ ...x, days_until: daysBetween(now, x.end as Date) }))
      .filter((x) => x.days_until >= 0 && x.days_until <= days)
      .sort((a, b) => a.days_until - b.days_until)
      .slice(0, 10)
      .map((x) => x.w);

    if (expiring.length === 0) {
      return res.json({
        reply: `I don’t see any warranties expiring in the next ${days} days.`,
        data: { expiring: [] },
      });
    }

    const lines = expiring.map((w) => `- ${w.product_name} (expires ${w.warranty_end})`);
    return res.json({
      reply: `You have ${expiring.length} item(s) expiring in the next ${days} days:\n${lines.join("\n")}`,
      data: { expiring: expiring.map(compactWarranty) },
    });
  }

  if (msgLower.includes("claim") || msgLower.includes("file a claim") || msgLower.includes("file")) {
    return res.json({
      reply:
        "To file a warranty claim: (1) open the item’s details, (2) confirm it’s still active, (3) gather invoice/serial number, (4) contact supplier/manufacturer, and (5) record the claim amount and date. If you tell me the item name, I can list what info we already have.",
    });
  }

  if (msgLower.includes("how many") && msgLower.includes("active")) {
    const active = warranties.filter((w) => w.status === "active").length;
    return res.json({ reply: `You currently have ${active} active warranties.` });
  }

  // Default
  return res.json({
    reply:
      "I can help with: (1) what expires soon, (2) how to file a claim, (3) basic counts/analytics. Try: “Which items expire next month?”",
  });
});

// --- Start ---
const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`WarrantyWizard backend running on http://localhost:${port}`);
});
