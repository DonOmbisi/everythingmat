import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart } from 'lucide-react';
import { apiService, Product } from '../services/api';
import img11 from '../images/img11.jpg';
import img12 from '../images/img12.jpg';
import img13 from '../images/img13.jpg';
import img14 from '../images/img14.jpg';
import img17 from '../images/img17.jpg';
import UserTargetedPopup from '../components/UserTargetedPopup';
import img1 from '../images/img1.jpg';
import img2 from '../images/img2.jpg';
import img3 from '../images/img3.jpg';
import img4 from '../images/img4.jpg';
import img15 from '../images/img15.jpg';
import img16 from '../images/img16.jpg';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './floatingGallery.css';

const HomePage: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const heroImages = [img11, img12, img13, img14, img17];

  // Category images mapping (choose representative images for each category)
  const categoryImages: Record<string, string> = {
    CLOTHING: img1,
    BREASTFEEDING: img2,
    'POST PARTUM': img3,
    'MUM ESSENTIALS': img4,
    // 'BABY ESSENTIALS': img5, // Hide for now
    // 'SELF & BABY CARE': img6, // Hide for now
  };

  // All gallery images (reduced to 6 for style)
  const galleryImages = [
    img1, img2, img3, img4, img11, img12
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        setIsTransitioning(false);
      }, 800);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (!userType) {
      const timer = setTimeout(() => setShowPopup(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch featured products (new products)
        const featured = await apiService.getProducts({ isNew: true, featured: true });
        setFeaturedProducts(featured.slice(0, 8));
        
        // Fetch best sellers (products that are not new but featured)
        const bestSellersData = await apiService.getProducts({ featured: true, isNew: false });
        setBestSellers(bestSellersData.slice(0, 4));
        
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to empty arrays if API fails
        setFeaturedProducts([]);
        setBestSellers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handlePopupSelect = (choice: string) => {
    localStorage.setItem('userType', choice);
    setShowPopup(false);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    localStorage.setItem('userType', 'dismissed');
  };

  // Helper function to get image from product
  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      // If the image path starts with /src/, import it dynamically
      const imagePath = product.images[0];
      if (imagePath.startsWith('/src/images/')) {
        const imageName = imagePath.split('/').pop();
        try {
          // Try to import the image dynamically
          return new URL(`../images/${imageName}`, import.meta.url).href;
        } catch {
          // Fallback to a placeholder
          return '/src/images/img1.jpg';
        }
      }
      return imagePath;
    }
    return '/src/images/img1.jpg';
  };

  return (
    <div className="animate-fade-in">
      <UserTargetedPopup open={showPopup} onSelect={handlePopupSelect} onClose={handlePopupClose} />
      
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center bg-beige">
        <div className="absolute inset-0">
          <img
            src={heroImages[currentImageIndex]}
            alt="Maternity Lifestyle"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ease-in-out ${
              isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />
        </div>
        <div className="absolute inset-0 bg-beige bg-opacity-40"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-6 leading-tight text-charcoal drop-shadow-lg">
              Embrace Your Glow
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-charcoal/80 font-medium">
              Feel beautiful, confident, and comfortable in every trimester. Discover maternity fashion that celebrates you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="bg-blush text-charcoal px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 transform hover:bg-blush/80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blush focus:ring-offset-2"
              >
                Feel the Glow
              </Link>
              <Link
                to="/about"
                className="border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-beige px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-beige">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-charcoal mb-4">Loved by 20,000+ Moms</h2>
          <p className="text-lg text-charcoal/80 max-w-2xl mx-auto">Real stories from real moms who felt nurtured, empowered, and beautifully connected to their motherhood journey.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Review 1 */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <img src={img15} alt="Mom 1" className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-blush" loading="lazy" />
            <p className="text-charcoal text-lg italic mb-2">“Wearing these clothes made me feel wrapped in comfort and love, just like I want my baby to feel.”</p>
            <span className="font-semibold text-charcoal">— Emily R.</span>
          </div>
          {/* Review 2 */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <img src={img16} alt="Mom 2" className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-blush" loading="lazy" />
            <p className="text-charcoal text-lg italic mb-2">“I felt so cared for and beautiful, even on the toughest days. These pieces truly celebrate motherhood.”</p>
            <span className="font-semibold text-charcoal">— Sarah M.</span>
          </div>
          {/* Review 3 */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <img src={img17} alt="Mom 3" className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-blush" loading="lazy" />
            <p className="text-charcoal text-lg italic mb-2">“Every time I wore these, I felt a gentle reminder of the strength and tenderness that comes with being a mom.”</p>
            <span className="font-semibold text-charcoal">— Olivia T.</span>
          </div>
        </div>
      </section>

      {/* New & Best Loved Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold mb-4">New & Best Loved</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover our latest arrivals and most loved pieces, designed with comfort, style, and real motherhood in mind.
            </p>
          </div>
          {/* Mini-gallery row of lifestyle images */}
          <div className="flex justify-center items-center gap-8 mb-10 h-72">
            <img src={img11} alt="Lifestyle" className="w-64 h-64 object-cover rounded-3xl shadow-2xl transform -rotate-6 scale-110 hover:scale-125 transition duration-300 animate-float-slow" loading="lazy" />
            <img src={img12} alt="Lifestyle" className="w-72 h-72 object-cover rounded-3xl shadow-2xl transform rotate-3 scale-125 hover:scale-140 transition duration-300 animate-float-medium" loading="lazy" />
            <img src={img13} alt="Lifestyle" className="w-64 h-64 object-cover rounded-3xl shadow-2xl transform rotate-8 scale-110 hover:scale-125 transition duration-300 animate-float-fast" loading="lazy" />
            <img src={img14} alt="Lifestyle" className="w-56 h-56 object-cover rounded-3xl shadow-xl transform -rotate-3 scale-105 hover:scale-120 transition duration-300 animate-float-slow" loading="lazy" />
          </div>
          {/* Unified product grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-80 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Merge featuredProducts and bestSellers, remove duplicates by id, show up to 8 */}
              {Array.from(new Map([...featuredProducts, ...bestSellers].map(p => [p.id, p])).values()).slice(0, 8).map((product) => (
                <div key={product.id} className="group bg-beige rounded-2xl shadow-lg p-4 flex flex-col justify-between h-full">
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.isNew && (
                      <span className="absolute top-4 left-4 bg-blush text-charcoal px-3 py-1 rounded-full text-sm font-semibold shadow">
                        New
                      </span>
                    )}
                    {product.badge && (
                      <span className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-playfair font-bold text-xl text-charcoal mb-2">{product.name}</h3>
                  {/* PAS Copy */}
                  <p className="text-charcoal/80 mb-4 text-base">
                    Tired of uncomfortable, itchy clothes? <br />
                    Ordinary maternity wear can leave you feeling frumpy and unseen. <br />
                    <span className="font-semibold">Feel the difference with our ultra-soft, bump-loving fabric—designed to make you glow.</span>
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-charcoal">${product.price}</span>
                      {product.salePrice && (
                        <span className="text-accent line-through">${product.salePrice}</span>
                      )}
                    </div>
                    <button className="text-accent hover:text-blush transition-colors">
                      <Heart size={20} />
                    </button>
                  </div>
                  <Link
                    to={`/product/${product.id}`}
                    className="w-full bg-blush text-charcoal font-semibold py-3 rounded-full shadow-md hover:bg-blush/80 transition-all duration-300 text-center text-lg mt-auto"
                  >
                    Shop the Look
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              View All
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Made with the finest materials for ultimate comfort and durability
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nursing Friendly</h3>
              <p className="text-gray-600">
                Designed with easy access for comfortable nursing and pumping
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">
                Free shipping on all orders over $100 within the continental US
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-50 via-white to-pink-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold mb-4">Shop by Category</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore our most popular categories
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(categoryImages).map(([cat, img]: [string, string]) => (
              <Link to={`/shop?category=${encodeURIComponent(cat)}`} key={cat} className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition relative">
                <div className="relative h-48 w-full">
                  <img src={img} alt={cat} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-pink-500/70 group-hover:via-pink-300/20 transition" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xl font-bold drop-shadow-lg group-hover:scale-105 transition">{cat.replace(/&/g, '&')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product Inspiration Gallery Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold mb-4">Inspiration Gallery</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              A glimpse into our style and community
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-2xl shadow-lg group">
                <img src={img} alt={`Gallery ${idx + 1}`} className="object-cover w-full h-56 md:h-64 transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 group-hover:from-pink-400/60 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Shop With Us Banner */}
      <section className="py-16 px-4 bg-pink-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <img src={img15} alt="Why Shop 1" className="rounded-2xl shadow-lg object-cover w-full h-40 md:h-56 border-4 border-white" loading="lazy" />
            <img src={img16} alt="Why Shop 2" className="rounded-2xl shadow-lg object-cover w-full h-40 md:h-56 border-4 border-white" loading="lazy" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-playfair font-bold mb-4 text-pink-600">Why Shop With Us?</h2>
            <p className="text-gray-700 text-lg mb-6">
              Experience the best in comfort, style, and support for every stage of motherhood. Our curated collection is designed to make you feel confident and cared for.
            </p>
            <Link to="/shop" className="inline-block bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* Pattern Interrupt Section */}
      <PatternInterruptQuote />

      {/* CTA Strip Section */}
      <CTAAnimatedStrip />
    </div>
  );
};

const PatternInterruptQuote: React.FC = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  React.useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 1, type: 'spring', bounce: 0.3 },
      });
    }
  }, [controls, inView]);

  return (
    <section className="py-24 bg-blush flex items-center justify-center">
      <motion.blockquote
        ref={ref}
        initial={{ opacity: 0, y: 80 }}
        animate={controls}
        className="max-w-4xl mx-auto text-center text-3xl md:text-5xl font-playfair font-bold text-charcoal leading-tight px-4"
      >
        “I didn’t think I could feel beautiful and cherished while pregnant — this changed everything.”
      </motion.blockquote>
    </section>
  );
};

const CTAAnimatedStrip: React.FC = () => {
  return (
    <section className="py-10 bg-blush flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
        className="flex flex-col md:flex-row items-center gap-6 w-full max-w-4xl mx-auto px-4"
      >
        <span className="text-2xl md:text-3xl font-playfair font-bold text-charcoal text-center md:text-left">
          Ready to feel beautiful every day?
        </span>
        <Link
          to="/shop"
          className="bg-charcoal text-blush font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:bg-charcoal/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-2"
        >
          Wrap Your Bump in Softness
        </Link>
      </motion.div>
    </section>
  );
};

export default HomePage;