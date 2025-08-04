const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.VITE_API_URL || '/api' 
  : '/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// API service class
class ApiService {
  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  }

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });
    return handleResponse(response);
  }

  // Products
  async getProducts(params?: {
    category?: string;
    subcategory?: string;
    colors?: string[];
    sizes?: string[];
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
    return handleResponse(response);
  }

  async getProduct(id: string) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(response);
  }

  async createProduct(productData: any) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  }

  async updateProduct(id: string, productData: any) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  }

  async deleteProduct(id: string) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Categories
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse(response);
  }

  async createCategory(categoryData: { name: string; slug: string }) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  }

  async deleteCategory(id: string) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Subcategories
  async getSubcategories(categoryId?: string) {
    const queryParams = categoryId ? `?categoryId=${categoryId}` : '';
    const response = await fetch(`${API_BASE_URL}/subcategories${queryParams}`);
    return handleResponse(response);
  }

  async createSubcategory(subcategoryData: { name: string; categoryId: string }) {
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(subcategoryData),
    });
    return handleResponse(response);
  }

  async deleteSubcategory(id: string) {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Orders
  async getOrders(userId?: string) {
    const queryParams = userId ? `?userId=${userId}` : '';
    const response = await fetch(`${API_BASE_URL}/orders${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async getOrder(id: string) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async createOrder(orderData: {
    items: any[];
    total: number;
    shipping?: any;
    payment?: any;
  }) {
    // Always include auth headers if available, but don't fail if not present
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add auth headers if token exists (for logged-in users)
    const authHeaders = getAuthHeaders();
    if (authHeaders.Authorization) {
      headers.Authorization = authHeaders.Authorization;
    }
    
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  }

  async updateOrder(id: string, orderData: any) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  }

  // File Upload
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse(response);
  }

  // Test connection
  async testConnection() {
    const response = await fetch(`${API_BASE_URL}/test`);
    return handleResponse(response);
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  category: string;
  subcategory: string;
  colors: string[];
  sizes: string[];
  images: string[];
  description: string;
  features: string[];
  isNew: boolean;
  badge?: string;
  inStock: boolean;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface Order {
  id: string;
  userId: string;
  items: any[];
  total: number;
  shipping: any;
  payment: any;
  date: string;
  status: string;
  statusHistory: Array<{ step: string; date: string }>;
} 