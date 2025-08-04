import React, { useState } from 'react';
import { Truck, MessageCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

const DeliveryPage: React.FC = () => {
  // Order Tracking State
  const [orderInput, setOrderInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<string | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Communication State
  const [message, setMessage] = useState('');
  const [messageStatus, setMessageStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [messageError, setMessageError] = useState('');

  // Real order tracking handler
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingLoading(true);
    setTrackingError('');
    setTrackingResult(null);
    try {
      // Replace with your real backend endpoint
      const res = await fetch(`/api/orders/track?order=${encodeURIComponent(orderInput)}`);
      if (!res.ok) throw new Error('Order not found.');
      const data = await res.json();
      setTrackingResult(data.status || 'Order found.');
    } catch (err: any) {
      setTrackingError(err.message || 'Order not found. Please check your order number or email.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Real admin message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessageError('');
    if (!message.trim()) {
      setMessageStatus('error');
      setMessageError('Please enter a message before sending.');
      return;
    }
    setMessageStatus('sending');
    try {
      // Replace with your real backend endpoint
      const res = await fetch('/api/orders/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderInput, message })
      });
      if (!res.ok) throw new Error('Failed to send message.');
      setMessageStatus('sent');
      setMessage('');
      setTimeout(() => setMessageStatus('idle'), 2000);
    } catch (err: any) {
      setMessageStatus('error');
      setMessageError(err.message || 'Failed to send message.');
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Order Tracking */}
        <section className="bg-beige rounded-xl shadow p-8">
          <div className="flex items-center mb-4">
            <Truck className="h-7 w-7 text-blush mr-2" />
            <h2 className="text-2xl font-playfair font-bold text-charcoal">Track Your Order</h2>
          </div>
          <form onSubmit={handleTrackOrder} className="flex flex-col gap-4">
            <input
              type="text"
              value={orderInput}
              onChange={e => setOrderInput(e.target.value)}
              placeholder="Enter your order number or email"
              className="px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blush"
            />
            <button
              type="submit"
              className="bg-blush text-charcoal font-semibold px-6 py-3 rounded shadow hover:bg-blush/80 transition flex items-center justify-center gap-2"
              disabled={trackingLoading}
            >
              {trackingLoading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
              {trackingLoading ? 'Tracking...' : 'Track Order'}
            </button>
            {/* Progress bar and result */}
            {trackingLoading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blush h-2.5 rounded-full animate-pulse" style={{ width: '80%' }}></div>
              </div>
            )}
            {trackingResult && (
              <div className="mt-2 flex items-center text-green-700 font-medium">
                <CheckCircle className="h-5 w-5 mr-1" /> {trackingResult}
              </div>
            )}
            {trackingError && (
              <div className="mt-2 flex items-center text-red-600 font-medium">
                <XCircle className="h-5 w-5 mr-1" /> {trackingError}
              </div>
            )}
          </form>
        </section>

        {/* Communicate with Admin */}
        <section className="bg-beige rounded-xl shadow p-8">
          <div className="flex items-center mb-4">
            <MessageCircle className="h-7 w-7 text-blush mr-2" />
            <h2 className="text-2xl font-playfair font-bold text-charcoal">Contact Delivery Support</h2>
          </div>
          <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message or update for the admin (e.g., change address, delivery issue, etc.)"
              className="px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blush min-h-[100px]"
            />
            <button
              type="submit"
              className="bg-blush text-charcoal font-semibold px-6 py-3 rounded shadow hover:bg-blush/80 transition flex items-center justify-center gap-2"
              disabled={messageStatus === 'sending'}
            >
              {messageStatus === 'sending' ? <Loader2 className="animate-spin h-5 w-5" /> : null}
              {messageStatus === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {messageStatus === 'sent' && (
              <div className="mt-2 flex items-center text-green-700 font-medium">
                <CheckCircle className="h-5 w-5 mr-1" /> Message sent! Our team will get back to you soon.
              </div>
            )}
            {messageStatus === 'error' && messageError && (
              <div className="mt-2 flex items-center text-red-600 font-medium">
                <XCircle className="h-5 w-5 mr-1" /> {messageError}
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default DeliveryPage; 