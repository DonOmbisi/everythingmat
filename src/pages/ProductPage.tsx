import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Shield, ChevronLeft } from 'lucide-react';
import { apiService, Product } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';

const ProductPage: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { dispatch } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Fetch product data from backend
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const productData = await apiService.getProduct(id);
        setProduct(productData);
        setSelectedColor(productData.colors[0] || '');
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Helper function to get image from product
  const getProductImage = (product: Product, index: number = 0) => {
    if (product.images && product.images.length > index) {
      const imagePath = product.images[index];
      if (imagePath.startsWith('/src/images/')) {
        const imageName = imagePath.split('/').pop();
        try {
          return new URL(`../images/${imageName}`, import.meta.url).href;
        } catch {
          return '/src/images/img1.jpg';
        }
      }
      return imagePath;
    }
    return '/src/images/img1.jpg';
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `${product.id}-${selectedSize}-${selectedColor}`,
        name: product.name,
        price: product.salePrice || product.price,
        size: selectedSize,
        color: selectedColor,
        image: getProductImage(product, 0),
        quantity
      }
    });
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: getProductImage(product, 0)
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            to="/shop"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            Continue Shopping
          </Link>
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
            <span className="mx-2">/</span>
            <Link to={`/shop/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-black transition-colors">
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-black">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
              <img
                src={getProductImage(product, activeImageIndex)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
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
              <button
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isInWishlist(product.id)
                      ? 'fill-current text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImageIndex === index ? 'border-[#E6397E]' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={getProductImage(product, index)}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-playfair font-bold text-charcoal mb-2">{product.name}</h1>
              <p className="text-accent mb-4">{product.colors && product.colors.length > 0 ? product.colors[0] : 'N/A'}</p>
              {/* PAS Copy */}
              <div className="mb-6">
                <p className="text-lg text-charcoal mb-2 font-semibold">Tired of itchy, unflattering maternity clothes?</p>
                <p className="text-charcoal/80 mb-2">Struggling to find something that makes you feel beautiful and comfortable as your body changes?</p>
                <p className="text-lg text-charcoal font-bold">Meet your new favorite: ultra-soft, bump-loving fabric that hugs you in all the right places—so you can glow with confidence every day.</p>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  {product.salePrice ? (
                    <>
                      <span className="text-2xl font-medium">${product.salePrice.toFixed(2)} AUD</span>
                      <span className="text-xl text-gray-500 line-through">${product.price.toFixed(2)} AUD</span>
                    </>
                  ) : (
                    <span className="text-2xl font-medium">${product.price.toFixed(2)} AUD</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-black mb-3">Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-[#E6397E] rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold text-black mb-3">Color: {selectedColor}</h3>
              <div className="flex space-x-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-colors ${
                      selectedColor === color ? 'border-[#E6397E]' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-black">Size: {selectedSize}</h3>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-sm text-[#E6397E] border-b border-[#E6397E] hover:border-gray-400 transition-colors"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-4 text-sm border rounded transition-colors ${
                      selectedSize === size
                        ? 'bg-[#E6397E] text-white border-[#E6397E]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#E6397E]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-black mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !product.inStock}
                className="w-full bg-[#E6397E] text-white py-4 px-6 font-medium hover:bg-[#E6397E]/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              
              {!product.inStock && (
                <p className="text-red-500 text-sm">This item is currently out of stock</p>
              )}
            </div>

            {/* Shipping Info */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="h-5 w-5" />
                <span>Free shipping on orders over $100</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <RotateCcw className="h-5 w-5" />
                <span>30 day returns</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-5 w-5" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
          <div className="mt-16">
          <h2 className="text-2xl font-serif text-black mb-8">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mock related products */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group">
                <div className="relative overflow-hidden">
                  <img
                    src={`/src/images/img${i}.jpg`}
                    alt={`Related product ${i}`}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Related Product {i}</h3>
                  <p className="text-sm text-gray-500">Color</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">$99.95 AUD</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Sticky Mobile CTA */}
      <StickyMobileCTA onClick={handleAddToCart} />
    </div>
  );
};

const StickyMobileCTA: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-blush shadow-2xl flex items-center justify-between px-4 py-4"
    >
      <span className="font-playfair font-bold text-lg text-charcoal">Wrap Your Bump in Softness</span>
      <button
        onClick={onClick}
        className="bg-charcoal text-blush font-semibold px-6 py-3 rounded-full text-base shadow-lg hover:bg-charcoal/90 transition-all duration-300"
      >
        Shop Now
      </button>
    </motion.div>
  );
};

export default ProductPage;