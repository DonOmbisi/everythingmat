const { MongoClient } = require('mongodb');
const path = require('path');

const uri = 'mongodb+srv://DONMIKE:dataviz@cluster0.ca18ur6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster00';
const dbName = 'everymat';
const collectionName = 'products';

// List of images to use for products
const images = [
  'img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg',
  'img6.png', 'img7.png', 'img8.png', 'img9.jpg', 'img10.jpg'
];

// Categories and subcategories matching Shop page
const categories = [
  { category: 'DRESSES', subcategory: 'Nursing Dresses' },
  { category: 'DRESSES', subcategory: 'All Dresses' },
  { category: 'NURSING & POSTPARTUM', subcategory: 'Nursing Tops' },
  { category: 'NURSING & POSTPARTUM', subcategory: 'Nursing Lounge & Sleepwear' },
  { category: 'SHOP BY', subcategory: 'Knitwear' },
  { category: 'SHOP BY', subcategory: 'Tops' },
  { category: 'DRESSES', subcategory: 'Mini Dresses' },
  { category: 'DRESSES', subcategory: 'Midi Dresses' },
  { category: 'NURSING & POSTPARTUM', subcategory: 'Nursing Bras' },
  { category: 'SHOP BY', subcategory: 'Lounge & Sleepwear' }
];

const sampleNames = [
  'Eden Knit Nursing Dress',
  'Savannah Mesh Dress',
  'Addison Nursing Knit',
  'Terry Nursing Sweat',
  'Theo Cosy Knit',
  'Layla Zip Through Knit',
  'Off-Shoulder Rib Top',
  'Luxe Knit Embrace Nursing Top',
  'Maternity Mini Dress',
  'Comfy Lounge Set'
];

const sampleDescriptions = [
  'A beautiful nursing dress designed for comfort and style. Perfect for the modern mama.',
  'Elegant mesh dress perfect for special occasions during pregnancy.',
  'Comfortable and stylish nursing top perfect for everyday wear.',
  'Comfortable terry nursing sweat perfect for lounging and nursing.',
  'A cozy knit piece perfect for layering during pregnancy.',
  'Versatile zip-through knit perfect for layering and nursing.',
  'Stylish off-shoulder top perfect for showing off your pregnancy glow.',
  'Premium knit embrace top for nursing moms.',
  'Chic mini dress for maternity style.',
  'Soft and comfy lounge set for home or hospital.'
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Remove existing products
    await collection.deleteMany({});

    // Create 10 products with matching categories/subcategories
    const products = images.map((img, i) => ({
      name: sampleNames[i % sampleNames.length],
      price: 29.99 + i * 10,
      category: categories[i].category,
      subcategory: categories[i].subcategory,
      colors: ['Black', 'Pink', 'Blue'],
      sizes: ['S', 'M', 'L'],
      images: [`/src/images/${img}`],
      description: sampleDescriptions[i % sampleDescriptions.length],
      features: ['Premium quality', 'Comfort fit', 'Stylish design'],
      isNew: i < 5,
      isBestseller: i % 2 === 0,
      inStock: true,
      featured: i % 3 === 0
    }));

    await collection.insertMany(products);
    console.log('Seeded products successfully with correct categories and subcategories!');
  } catch (err) {
    console.error('Error seeding products:', err);
  } finally {
    await client.close();
  }
}

seed(); 