const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';
const adminEmail = 'admin@example.com';
const adminPassword = 'admin123';

const products = [
  {
    name: 'Real-Time Test Dress',
    price: 99.99,
    category: 'DRESSES',
    subcategory: 'Nursing Dresses',
    colors: ['Red', 'Black'],
    sizes: ['S', 'M', 'L'],
    images: ['/src/images/img1.jpg'],
    description: 'A dress added via API script for real-time test.',
    features: ['Test feature 1', 'Test feature 2'],
    isNew: true,
    isBestseller: false,
    inStock: true,
    featured: true
  },
  {
    name: 'Real-Time Test Knit',
    price: 79.99,
    category: 'SHOP BY',
    subcategory: 'Knitwear',
    colors: ['Blue', 'Gray'],
    sizes: ['M', 'L'],
    images: ['/src/images/img2.jpg'],
    description: 'A knitwear product added via API script for real-time test.',
    features: ['Test feature A', 'Test feature B'],
    isNew: false,
    isBestseller: true,
    inStock: true,
    featured: false
  }
];

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

async function addProduct(product, token) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(product)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error('Failed to add product: ' + (err.error || res.status));
  }
  return res.json();
}

(async () => {
  try {
    const token = await loginAsAdmin();
    for (const product of products) {
      const result = await addProduct(product, token);
      console.log('Added product:', result.name);
    }
    console.log('All products added via API!');
  } catch (err) {
    console.error(err);
  }
})(); 