import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useAdmin } from '../context/AdminContext';
import { categories, subcategories } from '../data/products';

const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Set<string>>(new Set());
  const [isScrolled, setIsScrolled] = useState(false);
  const { state } = useCart();
  const { user } = useAuth();
  useWishlist();
  useAdmin();
  const navigate = useNavigate();
  const dropdownTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const handleAccountClick = () => {
    if (user) {
      navigate('/account');
    } else {
      navigate('/login');
    }
  };

  const handleMouseEnter = (category: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setHoveredCategory(category);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/shop/${category.toLowerCase().replace(/\s+/g, '-')}`);
    setHoveredCategory(null);
    setIsMobileMenuOpen(false);
    setExpandedMobileCategories(new Set()); // Reset expanded categories
  };

  const handleSubcategoryClick = (category: string, subcategory: string) => {
    navigate(`/shop/${category.toLowerCase().replace(/\s+/g, '-')}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`);
    setHoveredCategory(null);
    setIsMobileMenuOpen(false);
    setExpandedMobileCategories(new Set()); // Reset expanded categories
  };

  // Reset mobile menu state when menu is closed
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setExpandedMobileCategories(new Set());
    }
  }, [isMobileMenuOpen]);

  return (
    <header className={`bg-white transition-all duration-300 ${isScrolled ? 'shadow-md' : ''} sticky top-0 z-50`}>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-black transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo + Nav Group */}
            <div className="flex items-center gap-16">
              <Link to="/" className="flex-shrink-0">
                <h1 className="text-lg lg:text-xl font-serif font-normal tracking-widest select-none">
                  <span className="text-[#E6397E]">Everything</span>
                  <span className="text-black ml-1">Maternity</span>
                </h1>
              </Link>
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-10">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(category)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className="text-sm font-medium text-gray-700 hover:text-black transition-colors uppercase tracking-wide border-b-2 border-transparent hover:border-blush focus:outline-none py-2 px-1"
                    >
                      {category}
                    </button>
                    {/* Dropdown Menu */}
                    {hoveredCategory === category && subcategories[category as keyof typeof subcategories] && (
                      <div 
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                        onMouseEnter={() => handleMouseEnter(category)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="py-4 px-6">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            {category}
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {subcategories[category as keyof typeof subcategories].map((subcategory) => (
                              <button
                                key={subcategory}
                                onClick={() => handleSubcategoryClick(category, subcategory)}
                                className="text-left py-2 px-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors rounded-md w-full"
                              >
                                {subcategory}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4 ml-auto pl-8 border-l border-gray-200 h-12">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-black transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={handleAccountClick}
                className="p-2 text-gray-600 hover:text-black transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </button>
              <Link
                to="/cart"
                className="p-2 text-gray-600 hover:text-black transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blush text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.items.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-gray-100 py-4 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
            <input
              type="text"
              placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E6397E] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {categories.map((category) => {
              const isExpanded = expandedMobileCategories.has(category);
              const hasSubcategories = subcategories[category as keyof typeof subcategories];
              
              return (
                <div key={category} className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className="flex-1 text-left py-4 text-base font-medium text-gray-700 hover:text-black transition-colors uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#E6397E] rounded-md"
                      tabIndex={0}
                    >
                      {category}
                    </button>
                    {hasSubcategories && (
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedMobileCategories);
                          if (isExpanded) {
                            newExpanded.delete(category);
                          } else {
                            newExpanded.add(category);
                          }
                          setExpandedMobileCategories(newExpanded);
                        }}
                        className="p-2 text-gray-500 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6397E] rounded-md"
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category} submenu`}
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    )}
                  </div>
                  {isExpanded && hasSubcategories && (
                    <div className="ml-4 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {subcategories[category as keyof typeof subcategories].map((subcategory) => (
                        <button
                          key={subcategory}
                          onClick={() => handleSubcategoryClick(category, subcategory)}
                          className="w-full text-left py-3 px-3 text-base text-gray-600 hover:bg-gray-50 hover:text-black transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-[#E6397E]"
                          tabIndex={0}
                        >
                          {subcategory}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

// Add this CSS to your index.css file
