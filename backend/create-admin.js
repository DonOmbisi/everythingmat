const getDb = require('./db');
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    const db = await getDb();
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: 'admin@example.com' 
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      return { success: true, message: 'Admin already exists' };
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminUser = {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date()
    };
    
    await db.collection('users').insertOne(adminUser);
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    return { success: true };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, error: error.message };
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createAdmin()
    .then(() => {
      console.log('Admin creation script completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Admin creation script failed:', err);
      process.exit(1);
    });
}

module.exports = createAdmin;
