import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { AdminProvider } from './context/AdminContext';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import CustomerCarePage from './pages/CustomerCarePage';
import CartPage from './pages/CartPage';
import { Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));


function App() {
  useEffect(() => {
    const API_BASE_URL = process.env.NODE_ENV === 'production' 
      ? process.env.VITE_API_URL || 'https://everythingmat.onrender.com/api' 
      : '/api';
    fetch(`${API_BASE_URL}/visits`, { method: 'POST' });
  }, []);
  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <WishlistProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="min-h-screen bg-white">
                <Header />
                <main>
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>}>
                    <RoutesWithAuth />
                  </Suspense>
                </main>
                <Footer />
              </div>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

function RoutesWithAuth() {
  useAuth();
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/:category" element={<ShopPage />} />
      <Route path="/shop/:category/:subcategory" element={<ShopPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/customer-care" element={<CustomerCarePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/delivery" element={<DeliveryPage />} />
    </Routes>
  );
}

export default App;