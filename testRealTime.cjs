const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';
const adminEmail = 'admin@example.com';
const adminPassword = 'admin123';

async function loginAsAdmin() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword })
  });
  if (!res.ok) throw new Error('Admin login failed');
  const data = await res.json();
  return data.token;
}

async function addTestProduct(token) {
  const testProduct = {
    name: 'Real-Time Test Product',
    price: 149.99,
    category: 'DRESSES',
    subcategory: 'Nursing Dresses',
    colors: ['Red', 'Blue'],
    sizes: ['S', 'M', 'L'],
    images: ['/src/images/img1.jpg'],
    description: 'This product was added via API to test real-time updates.',
    features: ['Real-time test', 'Immediate update'],
    isNew: true,
    isBestseller: false,
    inStock: true,
    featured: true
  };

  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(testProduct)
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error('Failed to add product: ' + (err.error || res.status));
  }
  
  return res.json();
}

async function checkProducts() {
  const res = await fetch(`${API_BASE}/products`);
  const products = await res.json();
  console.log(`Total products in database: ${products.length}`);
  const testProduct = products.find(p => p.name === 'Real-Time Test Product');
  if (testProduct) {
    console.log('✅ Real-time test product found in database!');
    console.log(`   ID: ${testProduct.id}`);
    console.log(`   Category: ${testProduct.category}`);
  } else {
    console.log('❌ Real-time test product not found');
  }
}

(async () => {
  try {
    console.log('🔐 Logging in as admin...');
    const token = await loginAsAdmin();
    console.log('✅ Admin login successful');
    
    console.log('\n📦 Adding test product...');
    const result = await addTestProduct(token);
    console.log('✅ Product added successfully');
    console.log(`   Product ID: ${result.id}`);
    console.log(`   Product Name: ${result.name}`);
    
    console.log('\n🔄 Checking database...');
    await checkProducts();
    
    console.log('\n🎉 Real-time test completed!');
    console.log('   - Product should be in everymat.products database');
    console.log('   - Product should be visible in Shop page immediately');
    console.log('   - Socket.IO should have emitted "productsUpdated" event');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})(); 