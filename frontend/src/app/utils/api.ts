
// In production, VITE_API_URL should point to the backend (e.g. https://juris-backend.onrender.com/api)
// In dev, Vite proxy handles /api → localhost:4000 so we use a relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic API client wrapper for JURIS
 */
export const api = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Get token from Firebase (placeholder for now, will be updated in AuthContext integration)
    const token = localStorage.getItem('fb_id_token') || '';
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    } else if (process.env.NODE_ENV !== 'production') {
      // DEV BYPASS: Add test UID header if no token
      (headers as any)['x-test-uid'] = 'dev-user-001';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown API error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
