const API_BASE = "/api/v1";

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path.startsWith("http") ? path : `${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(json?.message || json?.error || text || `Request failed: ${res.status}`);
  }

  // ✅ normalize common backend shapes
  if (json && typeof json === "object") {
    if ("data" in json) return json.data as T;
    if ("result" in json) return json.result as T;
  }

  return json as T;
}


export const api = {
  getWarranties: () => req("/warranties"),
  getAnalytics: () => req("/warranties/analytics"),
  getExpiringSoon: (days = 30) => req(`/warranties/expiring/soon?days=${days}`),
  getExpired: () => req("/warranties/expired"),
  createWarranty: (body) => req("/warranties", { method: "POST", body: JSON.stringify(body) }),
  uploadInvoiceAndCreate: (file) => {
    const fd = new FormData();
    fd.append("invoice", file);
    return req("/upload/invoice/create", { method: "POST", body: fd });
  },
};
