import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Filter, Grid, List, Heart, Plus, ChevronDown } from 'lucide-react';
import { apiService, Product } from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { io } from 'socket.io-client';

const categories = [
  'SHOP BY',
  'DRESSES',
  'NURSING & POSTPARTUM',
  'EDITS',
  'SALE'
];

const subcategories = {
  'SHOP BY': [
    'Shop All', 'Dresses', 'Tops', 'Denim', 'Pants', 'Lounge & Sleepwear', 'Underwear', 'Knitwear', 'Activewear', 'Swimwear', 'Skirts', 'Shorts'
  ],
  'DRESSES': [
    'All Dresses', 'Mini Dresses', 'Midi Dresses', 'Maxi Dresses', 'Knit Dresses', 'Nursing Dresses'
  ],
  'NURSING & POSTPARTUM': [
    'Nursing Dresses', 'Nursing Tops', 'Nursing Knitwear', 'Nursing Bras', 'Nursing Camis & Tanks', 'Nursing Lounge & Sleepwear', 'Postpartum Support', 'C-section Friendly'
  ],
  'EDITS': [
    '1st Trimester', '2nd Trimester', '3rd Trimester', '4th Trimester', 'Baby Shower', 'Babymoon', 'Workwear', 'Party'
  ],
  'SALE': [
    'All Sale', 'Sale Nursing', 'Sale Dresses', 'Sale Tops', 'Sale Pants', 'Sale Skirts', 'Sale Shorts', 'Sale Knitwear', 'Sale Swimwear'
  ]
};

interface ProductCardProps {
  product: Product;
  isInWishlist: (id: string) => boolean;
  handleWishlistToggle: (product: Product) => void;
  handleAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isInWishlist, handleWishlistToggle, handleAddToCart }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Helper function to get image from product
  const getProductImage = (product: Product, index: number = 0) => {
    if (product.images && product.images.length > index) {
      const imagePath = product.images[index];
      if (imagePath && typeof imagePath === 'string' && imagePath.startsWith('/src/images/')) {
        const imageName = imagePath.split('/').pop();
        try {
          return new URL(`../images/${imageName}`, import.meta.url).href;
        } catch {
          return '/src/images/img1.jpg';
        }
      }
      return imagePath || '/src/images/img1.jpg';
    }
    return '/src/images/img1.jpg';
  };
  
  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
      <Link to={`/product/${product.id}`}>
          <img
            src={
              isHovered && product.images && product.images.length > 1
                ? getProductImage(product, 1)
                : getProductImage(product, 0)
            }
            alt={product.name}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
          />
      </Link>
        
        {/* Product badges */}
        {product.isNew && (
          <span className="absolute top-4 left-4 bg-black text-white text-xs px-2 py-1 uppercase tracking-wide">
            New In
          </span>
        )}
        {product.badge && (
          <span className="absolute top-4 right-4 bg-[#E6397E] text-white text-xs px-2 py-1">
            {product.badge}
          </span>
        )}
        
        {/* Quick action buttons */}
        <div className={`absolute top-4 right-4 flex flex-col space-y-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => handleWishlistToggle(product)}
            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          title="Add to wishlist"
        >
          <Heart
            className={`h-4 w-4 ${
              isInWishlist(product.id)
                ? 'fill-current text-red-500'
                : 'text-gray-600'
            }`}
          />
        </button>
          <button
            onClick={() => handleAddToCart(product)}
            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
            title="Quick add to cart"
          >
            <Plus className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="mt-4">
      <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#E6397E] transition-colors">
          {product.name}
        </h3>
          <p className="text-sm text-gray-500">{product.colors && product.colors.length > 0 ? product.colors[0] : 'N/A'}</p>
          <div className="flex items-center space-x-2 mt-1">
            {product.salePrice ? (
              <>
                <span className="text-sm font-medium text-gray-900">${product.salePrice.toFixed(2)} AUD</span>
                <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)} AUD</span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-900">${product.price.toFixed(2)} AUD</span>
          )}
        </div>
      </Link>
      </div>
    </div>
  );
};

const ShopPage: React.FC = () => {
  const { category, subcategory } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(
    category ? category.toUpperCase().replace(/-/g, ' ') : 'All'
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    subcategory ? subcategory.replace(/-/g, ' ') : 'All'
  );
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { dispatch: cartDispatch } = useCart();
  const [toast, setToast] = useState<string | null>(null);

  // State for products, loading, and error
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const params: any = {};
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        if (selectedSubcategory && selectedSubcategory !== 'All') {
          params.subcategory = selectedSubcategory;
        }
        if (selectedColors.length > 0) {
          params.colors = selectedColors;
        }
        if (selectedSizes.length > 0) {
          params.sizes = selectedSizes;
        }
        if (priceRange[0] > 0 || priceRange[1] < 500) {
          params.minPrice = priceRange[0];
          params.maxPrice = priceRange[1];
        }
        const fetchedProducts = await apiService.getProducts(params);
        setProducts(fetchedProducts);
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, selectedColors, selectedSizes, priceRange]);

  // --- Socket.IO real-time updates ---
  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('productsUpdated', () => {
      // Re-fetch products when notified
      const fetchProducts = async () => {
        try {
          setLoading(true);
          setError(null);
          const params: any = {};
          if (selectedCategory && selectedCategory !== 'All') {
            params.category = selectedCategory;
          }
          if (selectedSubcategory && selectedSubcategory !== 'All') {
            params.subcategory = selectedSubcategory;
          }
          if (selectedColors.length > 0) {
            params.colors = selectedColors;
          }
          if (selectedSizes.length > 0) {
            params.sizes = selectedSizes;
          }
          if (priceRange[0] > 0 || priceRange[1] < 500) {
            params.minPrice = priceRange[0];
            params.maxPrice = priceRange[1];
          }
          const fetchedProducts = await apiService.getProducts(params);
          setProducts(fetchedProducts);
        } catch (err) {
          setError('Failed to fetch products');
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    });
    return () => {
      socket.disconnect();
    };
  }, [selectedCategory, selectedSubcategory, selectedColors, selectedSizes, priceRange]);

  const handleColorChange = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter((c: string) => c !== color)
        : [...prev, color]
    );
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter((s: string) => s !== size)
        : [...prev, size]
    );
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images && product.images[0]
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        size: 'M',
        color: product.colors && product.colors.length > 0 ? product.colors[0] : 'N/A',
        image: product.images && product.images[0],
        quantity: 1
      }
    });
    setToast('Added to cart!');
    setTimeout(() => setToast(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div className="h-80 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm text-gray-600">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
            {selectedCategory !== 'All' && (
              <>
                <span className="mx-2">/</span>
                <span className="text-black">{selectedCategory}</span>
              </>
            )}
            {selectedSubcategory !== 'All' && (
              <>
                <span className="mx-2">/</span>
                <span className="text-black">{selectedSubcategory}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
            <h1 className="text-3xl font-serif text-black mb-2">
              {selectedCategory !== 'All' ? selectedCategory : 'Shop All'}
            </h1>
            {selectedSubcategory !== 'All' && (
              <p className="text-gray-600">{selectedSubcategory}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {products.length} products
            </p>
          </div>

          {/* Sort and View Controls */}
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#E6397E]"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
            </div>

            <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isInWishlist={isInWishlist}
                    handleWishlistToggle={handleWishlistToggle}
                    handleAddToCart={handleAddToCart}
                  />
                ))}
              </div>

        {products.length === 0 && !loading && (
              <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found.</p>
              </div>
            )}
          </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-[#E6397E] text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
};

export default ShopPage;