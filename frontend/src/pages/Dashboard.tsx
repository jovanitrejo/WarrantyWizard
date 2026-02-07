"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.ts";

type Warranty = {
  id: number;
  product_name: string;
  category?: string | null;
  serial_number?: string | null;
  warranty_end?: string | null;
  supplier?: string | null;
  status?: string | null;
  claim_filed?: boolean | null;
};

type Analytics = {
  total_warranties?: number;
  active_warranties?: number;
  expiring_value_30d?: number | string;
};

export default function Dashboard(): JSX.Element {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [expiring30, setExpiring30] = useState<Warranty[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<unknown>(null);

  const money = useMemo(
    () => (n: number | string | null | undefined) => {
      if (n == null) return "—";
      const num = typeof n === "string" ? Number(n) : n;
      if (Number.isNaN(num)) return "—";
      return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
    },
    []
  );

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const [a, e30, all] = await Promise.all([
          api.getAnalytics() as Promise<Analytics>,
          api.getExpiringSoon(30) as Promise<Warranty[]>,
          api.getWarranties() as Promise<Warranty[]>,
        ]);

        setAnalytics(a);
        setExpiring30(e30);
        setWarranties(all);
      } catch (e: unknown) {
        setErr(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onUpload = async (): Promise<void> => {
    if (!file) return;
    try {
      setErr(null);
      setUploadResult(null);

      const res = await (api.uploadInvoiceAndCreate(file) as Promise<unknown>);
      setUploadResult(res);

      const [e30, all] = await Promise.all([
        api.getExpiringSoon(30) as Promise<Warranty[]>,
        api.getWarranties() as Promise<Warranty[]>,
      ]);

      setExpiring30(e30);
      setWarranties(all);
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading dashboard…</div>;

  return (
    <div style={{ padding: 24, display: "grid", gap: 16 }}>
      <h1>WarrantyWizard Dashboard</h1>

      {err && (
        <div style={{ padding: 12, border: "1px solid #f00", color: "#900" }}>
          Error: {err}
        </div>
      )}

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Card title="Total Warranties" value={analytics?.total_warranties ?? warranties.length} />
        <Card title="Active" value={analytics?.active_warranties ?? "—"} />
        <Card title="Expiring (30d)" value={expiring30.length} />
        <Card title="$ At Risk (30d)" value={money(analytics?.expiring_value_30d ?? null)} />
      </div>

      {/* Upload invoice */}
      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <h2 style={{ marginTop: 0 }}>Upload Invoice</h2>
        <p style={{ marginTop: 0, opacity: 0.8 }}>
          Upload an invoice PDF/image and auto-create a warranty.
        </p>

        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button onClick={onUpload} disabled={!file} style={{ marginLeft: 8 }}>
          Upload &amp; Create
        </button>

        {uploadResult && (
          <pre style={{ marginTop: 12, padding: 12, background: "#f7f7f7", overflowX: "auto" }}>
            {JSON.stringify(uploadResult, null, 2)}
          </pre>
        )}
      </div>

      {/* Expiring soon */}
      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <h2 style={{ marginTop: 0 }}>Expiring Soon (30 days)</h2>

        {expiring30.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No warranties expiring in the next 30 days.</p>
        ) : (
          <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                <th>Product</th>
                <th>Supplier</th>
                <th>Warranty End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expiring30.slice(0, 10).map((w) => (
                <tr key={w.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{w.product_name}</td>
                  <td>{w.supplier ?? "—"}</td>
                  <td>{formatDate(w.warranty_end)}</td>
                  <td>{w.status ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* All warranties */}
      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <h2 style={{ marginTop: 0 }}>All Warranties</h2>

        <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>Product</th>
              <th>Category</th>
              <th>Serial</th>
              <th>End</th>
              <th>Claim Filed</th>
            </tr>
          </thead>
          <tbody>
            {warranties.slice(0, 25).map((w) => (
              <tr key={w.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{w.product_name}</td>
                <td>{w.category ?? "—"}</td>
                <td>{w.serial_number ?? "—"}</td>
                <td>{formatDate(w.warranty_end)}</td>
                <td>{w.claim_filed ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: React.ReactNode }): JSX.Element {
  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
      <div style={{ opacity: 0.7, fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value ?? "—"}</div>
    </div>
  );
}

function formatDate(d?: string | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString();
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Unknown error";
}
