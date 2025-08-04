import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  badge?: string;
  featured?: boolean;
  category: string;
  subcategory: string;
  colors: string[];
  sizes: string[];
  images: string[];
  description: string;
  features: string[];
  isNew: boolean;
  isBestseller: boolean;
  inStock: boolean;
  sku?: string;
  isActive?: boolean;
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
  role: string;
}

interface AdminContextType {
  isAdmin: boolean;
  user: User | null;
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSubcategories: () => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/subcategories`);
      const data = await res.json();
      setSubcategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  // Check for existing admin token on initialization
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Try to verify the token by making a test request
      fetch(`${API_BASE}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) {
          // Token is valid, set admin state
          setIsAdmin(true);
          // Try to get user info from token (basic decode)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === 'admin') {
              setUser({
                id: payload.userId,
                email: payload.email,
                name: payload.email, // fallback
                role: payload.role
              });
            }
          } catch (e) {
            console.log('Could not decode token payload');
          }
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('adminToken');
        }
      })
      .catch(() => {
        // Token verification failed, remove it
        localStorage.removeItem('adminToken');
      });
    }
    
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user.role === 'admin') {
          setIsAdmin(true);
          setUser(data.user);
          localStorage.setItem('adminToken', data.token);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setUser(null);
    localStorage.removeItem('adminToken');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
      });
      await fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
      });
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(category)
      });
      await fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const addSubcategory = async (subcategory: Omit<Subcategory, 'id'>) => {
    try {
      await fetch(`${API_BASE}/subcategories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(subcategory)
      });
      await fetchSubcategories();
    } catch (error) {
      console.error('Error adding subcategory:', error);
      throw error;
    }
  };

  const deleteSubcategory = async (id: string) => {
    try {
      await fetch(`${API_BASE}/subcategories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await fetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      user,
      products,
      categories,
      subcategories,
      setProducts,
      fetchProducts,
      fetchCategories,
      fetchSubcategories,
      loginAsAdmin,
      logoutAdmin,
      addProduct,
      updateProduct,
      deleteProduct,
      uploadImage,
      addCategory,
      deleteCategory,
      addSubcategory,
      deleteSubcategory
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext)!;