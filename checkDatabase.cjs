const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://DONMIKE:dataviz@cluster0.ca18ur6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster00';

async function checkDatabase() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // List all databases
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Check everymat database
    const everymatDb = client.db('everymat');
    const collections = await everymatDb.listCollections().toArray();
    console.log('\nCollections in everymat database:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check products collection
    const products = await everymatDb.collection('products').find({}).toArray();
    console.log(`\nProducts in everymat.products: ${products.length}`);
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category})`);
    });
    
    // Check if there are products in other databases
    const boltshopDb = client.db('boltshop');
    const boltshopProducts = await boltshopDb.collection('products').find({}).toArray();
    console.log(`\nProducts in boltshop.products: ${boltshopProducts.length}`);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

checkDatabase(); 