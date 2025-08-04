import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Newsletter Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-serif text-black mb-4">Share the journey with us!</h3>
          <p className="text-gray-600 mb-6">
            Exclusive member only offers and the latest Everything news are waiting for you ...
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#E6397E] focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="bg-[#E6397E] text-white px-6 py-3 rounded-r-md hover:bg-[#E6397E]/90 transition-colors font-medium"
            >
              SIGN ME UP!
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Customer Care */}
          <div>
            <h4 className="font-semibold text-black mb-4 text-sm uppercase tracking-wide">Customer Care</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/customer-care" className="hover:text-black transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-black transition-colors">
                  Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-black mb-4 text-sm uppercase tracking-wide">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/about" className="hover:text-black transition-colors">
                  About Everything
                </Link>
              </li>
            </ul>
          </div>

          {/* Removed Info column */}

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-black mb-4 text-sm uppercase tracking-wide">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:hello@everything.com.au" className="text-gray-600 hover:text-black transition-colors">
                  hello@everything.com.au
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+61710464342" className="text-gray-600 hover:text-black transition-colors">
                  0710 464342
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-gray-400 text-xs mt-0.5 flex-shrink-0">Mon - Fri | 9am-4pm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-wrap items-center justify-center space-x-4 text-xs text-gray-500">
            <span>American Express</span>
            <span>Apple Pay</span>
            <span>Google Pay</span>
            <span>Mastercard</span>
            <span>PayPal</span>
            <span>Shop Pay</span>
            <span>Union Pay</span>
            <span>Visa</span>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-6">
            {/* Instagram */}
            <a href="https://www.instagram.com/everythingmaternitykenya/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-gray-600 hover:text-[#E6397E] transition-colors">
              {/* Lucide Instagram icon or fallback SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <span className="text-xs font-medium">Instagram</span>
            </a>
            {/* TikTok */}
            <a href="https://www.tiktok.com/@everythingmaternity" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-gray-600 hover:text-[#E6397E] transition-colors">
              {/* TikTok SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.75 2h2.25a.75.75 0 0 1 .75.75v2.25a3.75 3.75 0 0 0 3.75 3.75h1.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-1.5a6 6 0 1 1-6-6V2.75A.75.75 0 0 1 12.75 2zm-2.25 10.5a3 3 0 1 0 3 3v-3h-3z"/>
              </svg>
              <span className="text-xs font-medium">TikTok</span>
            </a>
            {/* Threads */}
            <a href="https://www.threads.com/@everythingmaternitykenya" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-gray-600 hover:text-[#E6397E] transition-colors">
              {/* Threads SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 12c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4c1.1 0 2-.9 2-2"/>
              </svg>
              <span className="text-xs font-medium">Threads</span>
            </a>
            {/* YouTube */}
            <a href="https://l.instagram.com/?u=https%3A%2F%2Fyoutu.be%2FcJaj7RP-P2A.%3Ffbclid%3DPAZXh0bgNhZW0CMTEAAafIPH-hs1n3i_VEveVtjgry2eXa5nhiCatcOXUDJfbnx3pRL6GMr-M0AGwiBA_aem_0pJ1JgxTmWDdgQjEk_9vwQ&e=AT0l2xwSZEvsOikVCtpr6E6W_lQyuYHv6RdugTXfDMLODi2ySADTbx2CxIMlMKyipzz30ke8ppz8gEuviX2T9GMEorIBi0_G0l_bPnc" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-gray-600 hover:text-[#E6397E] transition-colors">
              {/* YouTube SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.8 8.001a2.75 2.75 0 0 0-1.93-1.94C18.2 6 12 6 12 6s-6.2 0-7.87.06A2.75 2.75 0 0 0 2.2 8.001 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.93 1.94C5.8 18 12 18 12 18s6.2 0 7.87-.06a2.75 2.75 0 0 0 1.93-1.94A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999zM10 15.5v-7l6 3.5-6 3.5z"/>
              </svg>
              <span className="text-xs font-medium">YouTube</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <div className="text-sm text-gray-600">
            © 2025, Everything Maternity.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;