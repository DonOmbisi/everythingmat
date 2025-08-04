const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Use environment variable or fallback to the connection string
const uri = process.env.MONGODB_URI || 'mongodb+srv://DONMIKE:dataviz@cluster0.ca18ur6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'myprojectdb';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    process.stdout.write(question);
    let password = '';
    
    stdin.on('data', function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function listAdmins() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const admins = await db.collection('users').find({ role: 'admin' }).toArray();
    
    console.log('\n=== Current Admin Users ===');
    if (admins.length === 0) {
      console.log('No admin users found.');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}, Name: ${admin.name}, Created: ${admin.createdAt}`);
      });
    }
    
    return admins;
  } finally {
    await client.close();
  }
}

async function deleteAdmin(email) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const result = await db.collection('users').deleteOne({ 
      email: email, 
      role: 'admin' 
    });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Admin user ${email} deleted successfully!`);
    } else {
      console.log(`❌ Admin user ${email} not found.`);
    }
    
    return result.deletedCount > 0;
  } finally {
    await client.close();
  }
}

async function createNewAdmin(email, password, name) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.log(`❌ User with email ${email} already exists.`);
      return false;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new admin user
    const adminUser = {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      createdAt: new Date()
    };
    
    await db.collection('users').insertOne(adminUser);
    console.log(`✅ New admin user created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    
    return true;
  } finally {
    await client.close();
  }
}

async function deleteAllAdmins() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const result = await db.collection('users').deleteMany({ role: 'admin' });
    console.log(`✅ Deleted ${result.deletedCount} admin user(s).`);
    
    return result.deletedCount;
  } finally {
    await client.close();
  }
}

async function main() {
  console.log('🔐 Admin Management Tool');
  console.log('=======================\n');
  
  try {
    // List current admins
    const admins = await listAdmins();
    
    console.log('\nWhat would you like to do?');
    console.log('1. Create new admin user');
    console.log('2. Delete specific admin user');
    console.log('3. Delete ALL admin users');
    console.log('4. Replace current admin with new one');
    console.log('5. Exit');
    
    const choice = await askQuestion('\nEnter your choice (1-5): ');
    
    switch(choice) {
      case '1':
        console.log('\n--- Create New Admin ---');
        const newEmail = await askQuestion('Enter new admin email: ');
        const newName = await askQuestion('Enter admin full name: ');
        const newPassword = await askPassword('Enter admin password: ');
        
        await createNewAdmin(newEmail, newPassword, newName);
        break;
        
      case '2':
        if (admins.length === 0) {
          console.log('No admin users to delete.');
          break;
        }
        console.log('\n--- Delete Specific Admin ---');
        const emailToDelete = await askQuestion('Enter email of admin to delete: ');
        await deleteAdmin(emailToDelete);
        break;
        
      case '3':
        console.log('\n--- Delete ALL Admins ---');
        const confirmDeleteAll = await askQuestion('Are you sure you want to delete ALL admin users? (yes/no): ');
        if (confirmDeleteAll.toLowerCase() === 'yes') {
          await deleteAllAdmins();
        } else {
          console.log('Operation cancelled.');
        }
        break;
        
      case '4':
        console.log('\n--- Replace Current Admin ---');
        const replaceEmail = await askQuestion('Enter new admin email: ');
        const replaceName = await askQuestion('Enter admin full name: ');
        const replacePassword = await askPassword('Enter admin password: ');
        
        // Delete all existing admins
        await deleteAllAdmins();
        
        // Create new admin
        await createNewAdmin(replaceEmail, replacePassword, replaceName);
        break;
        
      case '5':
        console.log('Goodbye!');
        break;
        
      default:
        console.log('Invalid choice.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
main();
