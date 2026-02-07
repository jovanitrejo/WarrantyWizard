import axios from 'axios';

// Use environment variable for API URL, fallback to proxy in development
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export interface Warranty {
  id: number;
  product_name: string;
  category?: string;
  serial_number?: string;
  supplier?: string;
  purchase_date: string;
  warranty_start: string;
  warranty_end: string;
  warranty_length_months?: number;
  purchase_cost?: number;
  status: 'active' | 'expiring_soon' | 'expired';
  claim_filed: boolean;
  claim_date?: string;
  claim_amount?: number;
  notes?: string;
  invoice_url?: string;
  created_at: string;
}

export interface Analytics {
  totals: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
  };
  claims: {
    filed: number;
    total_claim_amount: number;
  };
  estimated: {
    coverage_value: number;
  };
}

export const api = {
  // Warranties
  getWarranties: async (status?: string, search?: string): Promise<{ count: number; warranties: Warranty[] }> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('q', search);
    const response = await axios.get(`${API_BASE}/warranties?${params.toString()}`);
    return response.data;
  },

  getExpiringWarranties: async (days: number = 30): Promise<{ count: number; days: number; warranties: Warranty[] }> => {
    const response = await axios.get(`${API_BASE}/warranties/expiring?days=${days}`);
    return response.data;
  },

  createWarranty: async (warranty: Partial<Warranty>): Promise<{ warranty: Warranty }> => {
    const response = await axios.post(`${API_BASE}/warranties`, warranty);
    return response.data;
  },

  // Analytics
  getAnalytics: async (): Promise<Analytics> => {
    const response = await axios.get(`${API_BASE}/analytics`);
    return response.data;
  },

  // AI Chat
  chat: async (message: string): Promise<{ reply: string; data?: any }> => {
    const response = await axios.post(`${API_BASE}/ai-chat`, { message });
    return response.data;
  },
};

