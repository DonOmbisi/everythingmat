import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [trackOrderModal, setTrackOrderModal] = useState<{ open: boolean; order: any | null }>({ open: false, order: null });
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      fetch(`/api/orders?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoadingOrders(false);
        })
        .catch(() => setLoadingOrders(false));
    }
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Status steps for progress bar
  const statusSteps = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-beige-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif text-black">My Account</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.firstName}!</p>
        </div>
      </div>

      {/* Track Order Modal */}
      {trackOrderModal.open && trackOrderModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setTrackOrderModal({ open: false, order: null })}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-serif mb-4 text-gray-900">Order {trackOrderModal.order.id} Status</h2>
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-6">
              {statusSteps.map((step, idx) => {
                const currentIdx = statusSteps.indexOf(trackOrderModal.order.status);
                const isActive = idx <= currentIdx && trackOrderModal.order.status !== 'Cancelled';
                const isCancelled = trackOrderModal.order.status === 'Cancelled';
                return (
                  <div key={step} className="flex-1 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 border-2 ${
                      isCancelled && step === 'Cancelled'
                        ? 'bg-red-100 border-red-400 text-red-700'
                        : isActive
                        ? 'bg-primary border-primary text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-xs ${isActive ? 'text-primary' : isCancelled && step === 'Cancelled' ? 'text-red-700' : 'text-gray-400'}`}>{step}</span>
                  </div>
                );
              })}
            </div>
            <div className="mb-4 text-gray-700">
              {trackOrderModal.order.status === 'Delivered' && 'Your order has been delivered.'}
              {trackOrderModal.order.status === 'Shipped' && 'Your order has shipped and is on its way!'}
              {trackOrderModal.order.status === 'Processing' && 'Your order is being prepared.'}
              {trackOrderModal.order.status === 'Packed' && 'Your order has been packed and is ready to ship.'}
              {trackOrderModal.order.status === 'Out for Delivery' && 'Your order is out for delivery.'}
              {trackOrderModal.order.status === 'Cancelled' && 'Your order was cancelled.'}
            </div>
            <div className="text-left mb-2">
              <div className="font-semibold mb-1">Items:</div>
              <ul className="list-disc list-inside text-gray-600">
                {trackOrderModal.order.items.map((item: any, idx: number) => (
                  <li key={idx}>{item.name} (x{item.quantity})</li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <button
                className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
                onClick={() => setTrackOrderModal({ open: false, order: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'orders', label: 'Order History', icon: Package },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-black">Profile Information</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={user.firstName}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={user.lastName}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-black">Order History</h2>
                {loadingOrders ? (
                  <div className="text-center py-8 text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No orders found.</div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-black">Order {order.id}</h3>
                            <p className="text-sm text-gray-600">Placed on {order.date}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                              order.status === 'Delivered' 
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'Cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                            <p className="text-lg font-semibold text-black mt-1">€{order.total.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.name} (x{item.quantity})</span>
                              <span className="text-black">€{item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                          <button
                            className="text-black border border-black px-4 py-2 rounded hover:bg-black hover:text-white transition-colors"
                            onClick={() => setTrackOrderModal({ open: true, order })}
                          >
                            Track Order
                          </button>
                          <button className="text-black border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-black">My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Your wishlist is empty</p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="mt-4 bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-medium text-black mb-2">{item.name}</h3>
                        <p className="text-lg font-semibold text-black mb-4">€{item.price}</p>
                        <button
                          onClick={() => navigate(`/product/${item.id}`)}
                          className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                        >
                          View Product
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-black">Account Settings</h2>
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Email Preferences</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                        <span className="text-gray-700">Newsletter and promotions</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                        <span className="text-gray-700">Order updates and shipping notifications</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                        <span className="text-gray-700">New product announcements</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Privacy Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                        <span className="text-gray-700">Allow personalized recommendations</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                        <span className="text-gray-700">Share data for analytics</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <button className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;