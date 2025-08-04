import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, ShoppingCart, Truck, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const steps = [
  { label: 'Cart', icon: ShoppingCart },
  { label: 'Shipping', icon: Truck },
  { label: 'Payment', icon: CreditCard },
  { label: 'Review', icon: CheckCircle },
];

const paymentOptions = [
  { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
  { value: 'mpesa_prompt', label: 'Mpesa Prompt', icon: CreditCard },
  { value: 'mpesa_delivery', label: 'Mpesa on Delivery', icon: CreditCard },
  { value: 'cod', label: 'Cash on Delivery', icon: CreditCard },
];

const CheckoutPage: React.FC = () => {
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    email: user?.email || '',
    name: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Kenya',
    phone: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    mpesaPhone: '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Step navigation
  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  // Field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validation
  const validateStep = () => {
    if (step === 1) {
      if (!form.name || !form.address || !form.city || !form.postalCode || !form.country || !form.phone) return false;
    }
    if (step === 2) {
      if (form.paymentMethod === 'card') {
        if (!form.cardNumber || !form.cardName || !form.expiry || !form.cvv) return false;
      }
      if (form.paymentMethod === 'mpesa_prompt' || form.paymentMethod === 'mpesa_delivery') {
        if (!form.mpesaPhone) return false;
      }
    }
    return true;
  };

  // Place order
  const handlePlaceOrder = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      const orderData = {
        items: cartState.items,
        total: cartState.total,
        shipping: {
          name: form.name,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone,
          email: form.email,
        },
        payment: {
          method: form.paymentMethod,
          cardNumber: form.paymentMethod === 'card' ? '****' + form.cardNumber.slice(-4) : undefined,
          mpesaPhone: (form.paymentMethod === 'mpesa_prompt' || form.paymentMethod === 'mpesa_delivery') ? form.mpesaPhone : undefined,
        },
      };
      
      const data = await apiService.createOrder(orderData);
      setOrderId(data._id || data.id || null);
      setSuccess(true);
      cartDispatch({ type: 'CLEAR_CART' });
    } catch (err: any) {
      // More generic error handling - guest orders should work
      setError('Order failed. Please try again. ' + (err.message || ''));
      console.error('Order request failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Step content
  const renderStep = () => {
    if (success) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-green-700">Order Placed Successfully!</h2>
          <p className="mb-4 text-gray-700">Thank you for your purchase. Your order ID is <span className="font-mono bg-gray-100 px-2 py-1 rounded">{orderId || 'N/A'}</span>.</p>
          <button
            className="bg-black text-white px-6 py-3 rounded font-medium hover:bg-gray-800 transition-colors"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      );
    }
    if (step === 0) {
      // Cart Review
      return (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center"><ShoppingCart className="mr-2" /> Cart Review</h2>
          {cartState.items.length === 0 ? (
            <div className="text-center text-gray-500">Your cart is empty.</div>
          ) : (
            <div className="space-y-4 mb-6">
              {cartState.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-white rounded shadow p-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" loading="lazy" />
                  <div className="flex-1">
                    <div className="font-semibold text-black">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.color} • {item.size}</div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-black">KES {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-bold text-lg">KES {cartState.total.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    if (step === 1) {
      // Shipping Info
      return (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center"><Truck className="mr-2" /> Shipping Information</h2>
          {!user && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700">
                <strong>Guest Checkout:</strong> You can complete your order without creating an account. Your order details will be saved with the information you provide below.
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code *</label>
              <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country *</label>
              <input type="text" name="country" value={form.country} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
          </div>
        </div>
      );
    }
    if (step === 2) {
      // Payment
      return (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center"><CreditCard className="mr-2" /> Payment</h2>
          <div className="mb-4">
            <label className="block font-medium mb-2">Payment Method</label>
            <div className="flex flex-col gap-2">
              {paymentOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="paymentMethod" value={opt.value} checked={form.paymentMethod === opt.value} onChange={handleChange} />
                  <opt.icon className="w-5 h-5" />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          {form.paymentMethod === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cardholder Name *</label>
                <input type="text" name="cardName" value={form.cardName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Card Number *</label>
                <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry *</label>
                <input type="text" name="expiry" value={form.expiry} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVV *</label>
                <input type="text" name="cvv" value={form.cvv} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
            </div>
          )}
          {form.paymentMethod === 'mpesa_prompt' && (
            <div className="space-y-2 bg-green-50 rounded p-4 mt-2">
              <label className="block text-sm font-medium mb-1">Mpesa Phone *</label>
              <input type="tel" name="mpesaPhone" value={form.mpesaPhone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              <div className="text-xs text-green-700">A payment prompt will be sent to this number after you place your order.</div>
            </div>
          )}
          {form.paymentMethod === 'mpesa_delivery' && (
            <div className="space-y-2 bg-green-50 rounded p-4 mt-2">
              <label className="block text-sm font-medium mb-1">Mpesa Phone *</label>
              <input type="tel" name="mpesaPhone" value={form.mpesaPhone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              <div className="text-xs text-green-700">You will pay via Mpesa upon delivery.</div>
            </div>
          )}
          {form.paymentMethod === 'cod' && (
            <div className="text-yellow-700 bg-yellow-50 rounded p-3 mt-2">You will pay for your order in cash upon delivery.</div>
          )}
        </div>
      );
    }
    if (step === 3) {
      // Review & Place Order
      return (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center"><CheckCircle className="mr-2" /> Review & Place Order</h2>
          <div className="mb-4">
            <div className="font-semibold mb-1">Shipping Info</div>
            <div className="text-sm text-gray-700">{form.name}, {form.address}, {form.city}, {form.postalCode}, {form.country}, {form.phone}, {form.email}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">Payment Method</div>
            <div className="text-sm text-gray-700">
              {form.paymentMethod === 'card' && 'Credit/Debit Card'}
              {form.paymentMethod === 'mpesa_prompt' && 'Mpesa Prompt'}
              {form.paymentMethod === 'mpesa_delivery' && 'Mpesa on Delivery'}
              {form.paymentMethod === 'cod' && 'Cash on Delivery'}
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">Order Items</div>
            <ul className="text-sm text-gray-700 list-disc ml-6">
              {cartState.items.map((item) => (
                <li key={item.id}>{item.name} (x{item.quantity}) - KES {(item.price * item.quantity).toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-bold text-lg">KES {cartState.total.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Progress bar
  const renderProgress = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div className={`flex flex-col items-center ${i <= step ? 'text-black' : 'text-gray-400'}`}>
            <s.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{s.label}</span>
          </div>
          {i < steps.length - 1 && <ChevronRight className="w-5 h-5" />}
        </React.Fragment>
      ))}
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        {renderProgress()}
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        {renderStep()}
        {!success && (
          <div className="flex justify-between mt-8">
            {step > 0 && (
              <button
                className="bg-gray-200 text-black px-6 py-2 rounded hover:bg-gray-300 transition-colors"
                onClick={goBack}
                disabled={processing}
              >
                Back
              </button>
            )}
            {step < steps.length - 1 && (
              <button
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors ml-auto"
                onClick={goNext}
                disabled={!validateStep() || processing}
              >
                Next
              </button>
            )}
            {step === steps.length - 1 && (
              <button
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors ml-auto"
                onClick={handlePlaceOrder}
                disabled={processing}
              >
                {processing ? 'Placing Order...' : 'Place Order'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;