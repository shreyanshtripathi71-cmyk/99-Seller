/**
 * API Service for 99Sellers Backend
 * Standardized to Port 5001
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').trim().replace(/\/$/, '');
console.log(`[FRONTEND] Using API URL: ${API_BASE_URL}`);

// Token management
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('99sellers_token');
};

const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('99sellers_token', token);
  }
};

const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('99sellers_token');
  }
};

// Base fetch wrapper with auth
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  console.log(`[V8_API] Request: ${options.method || 'GET'} ${url}`);

  return fetch(url, {
    ...options,
    headers,
  });
};

// Generic API response handler
const handleResponse = async <T>(response: Response): Promise<{ success: boolean; data?: T; error?: string; warnings?: string[] }> => {
  try {
    const json = await response.json();

    if (response.ok) {
      // If backend uses the standardized { success: boolean, data?: any } pattern
      if (json && typeof json === 'object' && 'success' in json) {
        return {
          success: json.success,
          data: json.data !== undefined ? json.data : json,
          error: json.error || json.message,
          warnings: json.warnings
        };
      }
      return { success: true, data: json, warnings: json.warnings };
    } else {
      // Clear stale token on 401 Unauthorized
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('99sellers_token');
        console.warn('[V8_API] 401 Unauthorized - Clearing stale token');
      }
      return {
        success: false,
        error: json.error || json.message || `HTTP ${response.status}: ${response.statusText}`,
        data: json.data,
        warnings: json.warnings
      };
    }
  } catch (e) {
    if (response.ok) {
      return { success: true };
    }
    return {
      success: false,
      error: `Server error (${response.status}). Please try again.`,
    };
  }
};

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: async (email: string, password: string, captchaToken?: string) => {
    const response = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ Email: email, Password: password, captchaToken }),
    });

    const result = await handleResponse<{ token: string; user?: any; userType?: string }>(response);

    if (result.success && result.data?.token) {
      setToken(result.data.token);
    }

    return result;
  },

  register: async (data: any) => {
    const response = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        FirstName: data.firstName,
        LastName: data.lastName,
        Email: data.email,
        Password: data.password,
        Contact: data.contact,
        token: data.captchaToken
      }),
    });

    return handleResponse<{ message: string }>(response);
  },

  updateProfile: async (data: any) => {
    const response = await fetchWithAuth('/api/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return handleResponse<any>(response);
  },

  changePassword: async (data: any) => {
    const response = await fetchWithAuth('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return handleResponse<any>(response);
  },

  forgotPassword: async (email: string) => {
    const response = await fetchWithAuth('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return handleResponse<any>(response);
  },

  resetPassword: async (data: any) => {
    const response = await fetchWithAuth('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return handleResponse<any>(response);
  },

  logout: () => {
    removeToken();
  },

  getToken,
  setToken,
  removeToken,
};

// ============================================
// SUBSCRIPTION API
// ============================================

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  type: string;
  expiresAt: string | null;
  price: number;
  billingCycle: string;
  planType?: string;
  status?: string;
  autoRenew: boolean;
}

export const subscriptionAPI = {
  getStatus: async () => {
    const response = await fetchWithAuth('/api/subscription/status');
    return handleResponse<SubscriptionStatus>(response);
  },

  startTrial: async () => {
    const response = await fetchWithAuth('/api/subscription/trial/start', {
      method: 'POST',
    });
    return handleResponse<{ message: string }>(response);
  },

  getPlans: async () => {
    const response = await fetchWithAuth('/api/subscription/plans');
    return handleResponse<any[]>(response);
  },

  create: async (planId: string, billingCycle: string) => {
    const response = await fetchWithAuth('/api/subscription/create', {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle }),
    });
    return handleResponse<any>(response);
  },

  cancel: async () => {
    const response = await fetchWithAuth('/api/subscription/cancel', {
      method: 'POST',
    });
    return handleResponse<any>(response);
  },
};

// Placeholders for other APIs to satisfy imports elsewhere (can be restored later if needed)
export const propertiesAPI = { getAll: async () => ({ success: true, data: [] }), getById: async (id: any) => ({ success: true, data: null }) };
export const auctionsAPI = { getLive: async () => ({ success: true, data: [] }) };
export const savedLeadsAPI = {
  getAll: async () => {
    const response = await fetchWithAuth('/api/saved-properties');
    return handleResponse<any[]>(response);
  },
  save: async (propertyId: number) => {
    const response = await fetchWithAuth('/api/saved-properties', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
    return handleResponse<any>(response);
  },
  remove: async (propertyId: number) => {
    const response = await fetchWithAuth(`/api/saved-properties/${propertyId}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(response);
  }
};
export const savedSearchesAPI = {
  create: async (name: string, filters: any) => {
    const response = await fetchWithAuth('/api/saved-searches', {
      method: 'POST',
      body: JSON.stringify({ name, filters }),
    });
    return handleResponse<any>(response);
  },
  getAll: async () => {
    const response = await fetchWithAuth('/api/saved-searches');
    return handleResponse<any[]>(response);
  },
  getById: async (id: string | number) => {
    const response = await fetchWithAuth(`/api/saved-searches/${id}`);
    return handleResponse<any>(response);
  },
  delete: async (id: number) => {
    const response = await fetchWithAuth(`/api/saved-searches/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(response);
  }
};
export const notificationsAPI = { getAll: async () => ({ success: true, data: [] }), markAsRead: async (id: any) => ({ success: true }) };
export const dashboardAPI = { getStats: async () => ({ success: true, data: {} }), getRecentActivity: async () => ({ success: true, data: [] }) };
export const premiumAPI = { getOwnerLeads: async () => ({ success: true, data: [] }), getLoanLeads: async () => ({ success: true, data: [] }) };
export const poppinsAPI = {
  getActive: async () => {
    const response = await fetchWithAuth('/api/poppins/active');
    return handleResponse<any[]>(response);
  }
};
export const adminAPI = {
  getStats: async () => {
    const response = await fetchWithAuth('/api/admin/stats');
    return handleResponse<any>(response);
  },
  getHistoricalStats: async () => {
    const response = await fetchWithAuth('/api/admin/historical-stats');
    return handleResponse<any>(response);
  },
  users: {
    getStats: async () => {
      const response = await fetchWithAuth('/api/admin/stats');
      const result = await handleResponse<any>(response);
      return result.success ? { success: true, data: result.data.users } : result;
    },
    getAll: async () => {
      const response = await fetchWithAuth('/api/admin/users');
      return handleResponse<any[]>(response);
    },
    create: async (data: any) => {
      const response = await fetchWithAuth('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    update: async (id: string | number, data: any) => {
      const response = await fetchWithAuth(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    delete: async (id: string | number) => {
      const response = await fetchWithAuth(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<any>(response);
    },
    uploadCSV: async (users: any[]) => {
      const response = await fetchWithAuth('/api/admin/users/upload', {
        method: 'POST',
        body: JSON.stringify({ users }),
      });
      return handleResponse<any>(response);
    }
  },
  owners: {
    getStats: async () => {
      const response = await fetchWithAuth('/api/admin/owners/stats');
      return handleResponse<any>(response);
    },
    getAll: async () => {
      const response = await fetchWithAuth('/api/admin/owners');
      return handleResponse<{ owners: any[] }>(response);
    },
    create: async (data: any) => {
      const response = await fetchWithAuth('/api/admin/owners', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    update: async (id: string | number, data: any) => {
      const response = await fetchWithAuth(`/api/admin/owners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    delete: async (id: string | number) => {
      const response = await fetchWithAuth(`/api/admin/owners/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<any>(response);
    }
  },
  loans: {
    getStats: async () => {
      const response = await fetchWithAuth('/api/admin/loans/stats');
      return handleResponse<any>(response);
    },
    getAll: async () => {
      const response = await fetchWithAuth('/api/admin/loans');
      return handleResponse<{ loans: any[] }>(response);
    },
    create: async (data: any) => {
      const response = await fetchWithAuth('/api/admin/loans', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    update: async (id: string | number, data: any) => {
      const response = await fetchWithAuth(`/api/admin/loans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    delete: async (id: string | number) => {
      const response = await fetchWithAuth(`/api/admin/loans/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<any>(response);
    }
  },
  subscriptions: {
    getStats: async () => {
      const response = await fetchWithAuth('/api/admin/stats');
      const result = await handleResponse<any>(response);
      return result.success ? { success: true, data: result.data.subscriptions } : result;
    },
    getAll: async () => {
      const response = await fetchWithAuth('/api/admin/subscriptions');
      return handleResponse<any[]>(response);
    },
    getPlans: async () => {
      const response = await fetchWithAuth('/api/admin/subscriptions/plans');
      return handleResponse<any[]>(response);
    },
    createOrUpdatePlan: async (data: any) => {
      const response = await fetchWithAuth('/api/admin/subscriptions/plans', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    deletePlan: async (id: number | string) => {
      const response = await fetchWithAuth(`/api/admin/subscriptions/plans/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<any>(response);
    },
    cancel: async (id: number | string) => {
      const response = await fetchWithAuth(`/api/admin/subscriptions/${id}/cancel`, {
        method: 'POST',
      });
      return handleResponse<any>(response);
    }
  },
  properties: {
    getStats: async () => {
      const response = await fetchWithAuth('/api/admin/stats');
      const result = await handleResponse<any>(response);
      return result.success ? { success: true, data: result.data.properties } : result;
    },
    getAll: async () => {
      const response = await fetchWithAuth('/api/admin/properties');
      return handleResponse<any[]>(response);
    },
    getById: async (id: string | number) => {
      const response = await fetchWithAuth(`/api/admin/properties/${id}`);
      return handleResponse<any>(response);
    },
    update: async (id: string | number, data: any) => {
      const response = await fetchWithAuth(`/api/admin/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    delete: async (id: string | number) => {
      const response = await fetchWithAuth(`/api/admin/properties/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<any>(response);
    },
    create: async (data: any) => {
      const response = await fetchWithAuth('/api/admin/properties', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    uploadImage: async (id: number | string, file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const token = getToken();
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = `${API_BASE_URL}/api/admin/properties/${id}/image`;
      console.log('[DEBUG] Uploading image to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      return handleResponse<any>(response);
    },
    deleteImage: async (id: number | string) => {
      const response = await fetchWithAuth(`/api/admin/properties/${id}/image`, {
        method: 'DELETE',
      });
      return handleResponse<any>(response);
    }
  },
  auctions: {
    getStats: async () => {
      const response = await fetchWithAuth('/api/admin/stats');
      const result = await handleResponse<any>(response);
      return result.success ? { success: true, data: result.data.auctions } : result;
    },
    getAll: async () => {
      const response = await fetchWithAuth('/api/admin/auctions');
      return handleResponse<any[]>(response);
    },
    create: async (data: any) => {
      const response = await fetchWithAuth('/api/admin/auctions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    update: async (id: number | string, data: any) => {
      const response = await fetchWithAuth(`/api/admin/auctions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    delete: async (id: number | string) => {
      const response = await fetchWithAuth(`/api/admin/auctions/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<any>(response);
    }
  },
  crawler: {
    getRuns: async () => {
      const response = await fetchWithAuth('/api/admin/crawler/runs');
      return handleResponse<any[]>(response);
    },
    getErrors: async () => {
      const response = await fetchWithAuth('/api/admin/crawler/errors');
      return handleResponse<any[]>(response);
    }
  },
  poppins: {
    getAll: async () => {
      const response = await fetchWithAuth('/api/admin/poppins');
      return handleResponse<any[]>(response);
    },
    create: async (data: any) => {
      const response = await fetchWithAuth('/api/admin/poppins', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    update: async (id: string | number, data: any) => {
      const response = await fetchWithAuth(`/api/admin/poppins/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    },
    delete: async (id: string | number) => {
      const response = await fetchWithAuth(`/api/admin/poppins/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<any>(response);
    }
  },
  activities: {
    getRecent: async () => {
      const response = await fetchWithAuth('/api/admin/activities');
      return handleResponse<any[]>(response);
    }
  },
  content: {
    list: async () => {
      const response = await fetchWithAuth('/api/admin/content');
      return handleResponse<any[]>(response);
    },
    get: async (key: string) => {
      const response = await fetchWithAuth(`/api/admin/content/${key}`);
      return handleResponse<any>(response);
    },
    update: async (key: string, value: any, contentType: string = 'json') => {
      const response = await fetchWithAuth(`/api/admin/content/${key}`, {
        method: 'POST',
        body: JSON.stringify({ value, contentType }),
      });
      return handleResponse<any>(response);
    },
    delete: async (key: string) => {
      const response = await fetchWithAuth(`/api/admin/content/${key}`, {
        method: 'DELETE',
      });
      return handleResponse<any>(response);
    },
    uploadImage: async (formData: FormData) => {
      const token = getToken();
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/api/admin/content/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse<{ url: string }>(response);
    }
  },
  dataImport: {
    import: async (formData: FormData) => {
      const token = getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/import`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse<any>(response);
    },
    getTemplateUrl: (target: string) => `${API_BASE_URL}/api/admin/import/template/${target}`
  },
  billing: {
    getAllInvoices: async () => {
      const response = await fetchWithAuth('/api/admin/billing/invoices');
      return handleResponse<any[]>(response);
    }
  }
};

export const feedbackAPI = {
  submit: async (data: any) => {
    const response = await fetchWithAuth('/api/feedback/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },
  getAll: async () => {
    const response = await fetchWithAuth('/api/admin/feedback/all');
    return handleResponse<any[]>(response);
  },
  updateStatus: async (id: number | string, status: string) => {
    const response = await fetchWithAuth(`/api/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return handleResponse<any>(response);
  }
};

// ============================================
// BILLING API
// ============================================
export const billingAPI = {
  getOverview: async () => {
    const response = await fetchWithAuth('/api/billing/overview');
    return handleResponse<any>(response);
  },
  getInvoices: async () => {
    const response = await fetchWithAuth('/api/billing/invoices');
    return handleResponse<any[]>(response);
  },
  getPaymentMethods: async () => {
    const response = await fetchWithAuth('/api/billing/payment-methods');
    return handleResponse<any[]>(response);
  },
  addPaymentMethod: async (data: any) => {
    const response = await fetchWithAuth('/api/billing/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },
  updateBillingAddress: async (data: any) => {
    const response = await fetchWithAuth('/api/billing/address', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  }
};

export const paymentAPI = {
  createPaymentIntent: async (planId: string, billingCycle: string) => {
    const response = await fetchWithAuth('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle }),
    });
    return handleResponse<{ clientSecret: string; amount: number }>(response);
  }
};

// ============================================
// EXPORT API
// ============================================
export const exportAPI = {
  exportSavedLeads: async (format: 'csv' | 'json' | 'excel', type: 'saved' | 'search' = 'saved', filters: any = {}) => {
    const response = await fetchWithAuth('/api/export/saved-leads', {
      method: 'POST',
      body: JSON.stringify({ format, type, filters }),
    });
    return handleResponse<{ content: string; filename: string; mimeType: string; recordCount: number }>(response);
  },
  getHistory: async () => {
    const response = await fetchWithAuth('/api/export/history');
    return handleResponse<any[]>(response);
  },
  getUsage: async () => {
    const response = await fetchWithAuth('/api/export/usage');
    return handleResponse<{
      usage: number;
      limit: number;
      remaining: number;
      userType: string;
      resetDate: string;
    }>(response);
  }
};

