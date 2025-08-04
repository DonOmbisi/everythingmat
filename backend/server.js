const express = require('express');
const cors = require('cors');
const getDb = require('./db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { sendEmail } = require('./emailService');
const {
  getOrderConfirmationTemplate,
  getOrderStatusUpdateTemplate,
  getContactFormTemplate,
  getWelcomeEmailTemplate,
} = require('./emailTemplates');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const twilio = require('twilio');
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const winston = require('winston');
const expressWinston = require('express-winston');
const Sentry = require('@sentry/node');
require('dotenv').config();

// Platform compatibility
const isVercel = process.env.VERCEL === '1';
const isRender = process.env.RENDER === 'true';
// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0, // Adjust for production
});

// --- Socket.IO setup ---
const app = express();
let server;

// Disable Socket.IO for serverless
if (!isVercel) {
  const http = require('http');
  const { Server } = require('socket.io');
  server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('A user connected');
  });
} else {
  // For Vercel, we don't need a server instance
  server = null;
}

// Disable file uploads for serverless (Vercel doesn't support persistent file storage)
if (!isVercel) {
  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}


// Configure CORS for frontend
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL,
        'https://everythingmat-1.onrender.com',
        'https://everythingmat.onrender.com'
      ].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(express.json());
// Sentry request handler (must be before all other middleware)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
// Sanitize all incoming requests
app.use(mongoSanitize());
// Apply rate limiting to all API routes
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
}));
// Static file serving only for non-Vercel environments
if (!isVercel) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Disable file logging for serverless
if (!isVercel) {
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/requests.log' })
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false,
  }));
} else {
  // Simple console logging for Vercel
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// --- Authentication ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordLength: password?.length });
    const db = await getDb();
    
    const user = await db.collection('users').findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Comparing passwords...');
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);
    if (!validPassword) {
      console.log('Password comparison failed');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const db = await getDb();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      email,
      password: hashedPassword,
      name,
      role: 'user',
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(user);
    user.id = result.insertedId.toString();
    delete user.password;

    // Send welcome email
    try {
      const welcomeEmail = getWelcomeEmailTemplate(user);
      await sendEmail({
        to: user.email,
        subject: welcomeEmail.subject,
        text: welcomeEmail.text,
        html: welcomeEmail.html,
      });
      console.log(`Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError.message);
      // Don't fail registration if email fails
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Categories ---
app.get('/api/categories', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.collection('categories').find({}).toArray();
    categories.forEach(c => { c.id = c._id.toString(); delete c._id; });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { name, slug } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const category = { name, slug, createdAt: new Date() };
    const result = await db.collection('categories').insertOne(category);
    category.id = result.insertedId.toString();
    
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Subcategories ---
app.get('/api/subcategories', async (req, res) => {
  try {
    const db = await getDb();
    const { categoryId } = req.query;
    
    const query = categoryId ? { categoryId } : {};
    const subcategories = await db.collection('subcategories').find(query).toArray();
    subcategories.forEach(s => { s.id = s._id.toString(); delete s._id; });
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subcategories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { name, categoryId } = req.body;
    
    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Name and categoryId are required' });
    }

    const subcategory = { name, categoryId, createdAt: new Date() };
    const result = await db.collection('subcategories').insertOne(subcategory);
    subcategory.id = result.insertedId.toString();
    
    res.status(201).json(subcategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subcategories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    await db.collection('subcategories').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Products ---
app.get('/api/products', async (req, res) => {
  try {
    const db = await getDb();
    const {
      category,
      subcategory,
      colors,
      sizes,
      minPrice,
      maxPrice,
      featured,
      isNew,
      isBestseller
    } = req.query;

    // Build MongoDB query
    const query = {};
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (colors) {
      if (Array.isArray(colors)) {
        query.colors = { $in: colors };
      } else {
        query.colors = { $in: [colors] };
      }
    }
    if (sizes) {
      if (Array.isArray(sizes)) {
        query.sizes = { $in: sizes };
      } else {
        query.sizes = { $in: [sizes] };
      }
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (featured !== undefined) query.featured = featured === 'true';
    if (isNew !== undefined) query.isNew = isNew === 'true';
    if (isBestseller !== undefined) query.isBestseller = isBestseller === 'true';

    const products = await db.collection('products').find(query).toArray();
    products.forEach(p => { p.id = p._id.toString(); delete p._id; });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.id = product._id.toString();
    delete product._id;
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create product
app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const product = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('products').insertOne(product);
    product.id = result.insertedId.toString();
    // Real-time updates disabled for serverless
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update product
app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const update = {
      ...req.body,
      updatedAt: new Date()
    };
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: 'Product not found' });
    const updated = result.value;
    updated.id = updated._id.toString();
    delete updated._id;
    // Real-time updates disabled for serverless
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete product
app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    // Real-time updates disabled for serverless
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Test route ---
app.get('/api/test', async (req, res) => {
  try {
    const db = await getDb();
    const now = new Date();
    res.json({ now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- File Upload (Disabled for Vercel) ---
app.post('/api/upload', async (req, res) => {
  res.status(501).json({ error: 'File upload not supported in serverless environment. Please use a cloud storage service.' });
});
// Sentry error handler (must be after all other middleware)
app.use(Sentry.Handlers.errorHandler());
// Disable file-based error logging for serverless
if (!isVercel) {
  app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/errors.log' })
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
}

// --- Orders ---
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { userId } = req.query;
    
    // If admin, can see all orders. If user, can only see their own
    const query = req.user.role === 'admin' ? {} : { userId: req.user.userId };
    if (userId && req.user.role === 'admin') {
      query.userId = userId;
    }
    
    const orders = await db.collection('orders').find(query).sort({ date: -1 }).toArray();
    orders.forEach(o => { o.id = o._id.toString(); delete o._id; });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Check if user can access this order
    if (req.user.role !== 'admin' && order.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    order.id = order._id.toString();
    delete order._id;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Create Order (User Checkout) - Supports both authenticated and guest users ---
app.post('/api/orders', async (req, res) => {
  try {
    const db = await getDb();
    const { items, total, shipping, payment } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }
    
    // Check if user is authenticated (optional)
    let userId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        // Token is invalid but we still allow guest checkout
        console.log('Invalid token for order, proceeding as guest:', err.message);
      }
    }
    
    const now = new Date();
    const order = {
      userId: userId, // Will be null for guest orders
      isGuest: !userId, // Flag to indicate guest order
      items,
      total,
      shipping: shipping || {},
      payment: payment || {},
      date: now.toISOString(),
      status: 'Processing',
      statusHistory: [
        { step: 'Processing', date: now.toISOString() }
      ]
    };
    const result = await db.collection('orders').insertOne(order);
    order.id = result.insertedId.toString();

    // Send order confirmation email if email is provided
    if (order.shipping && order.shipping.email) {
      try {
        const confirmationEmail = getOrderConfirmationTemplate(order);
        await sendEmail({
          to: order.shipping.email,
          subject: confirmationEmail.subject,
          text: confirmationEmail.text,
          html: confirmationEmail.html,
        });
        console.log(`Order confirmation email sent to ${order.shipping.email}`);
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError.message);
        // Don't fail order creation if email fails
      }
    }

    // Send WhatsApp message to admin via Twilio
    try {
      const adminWhatsapp = process.env.ADMIN_WHATSAPP_TO;
      const fromWhatsapp = process.env.TWILIO_WHATSAPP_FROM;
      const customerName = order.shipping?.name || 'Guest';
      const orderSummary =
        `🛒 New Order Received!\n` +
        `Order ID: ${order.id}\n` +
        `Customer: ${customerName}\n` +
        `Total: ${order.total}\n` +
        `Items:\n` +
        order.items.map((item, i) => `  ${i+1}. ${item.name} x${item.quantity}`).join('\n');
      await twilioClient.messages.create({
        from: fromWhatsapp,
        to: adminWhatsapp,
        body: orderSummary
      });
      console.log('WhatsApp order notification sent to admin.');
    } catch (waError) {
      console.error('Failed to send WhatsApp order notification:', waError.message);
      // Don't fail order creation if WhatsApp fails
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin: Update Order (status, etc.) ---
app.put('/api/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const update = req.body;
    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // If status is changing, push to statusHistory and send email notification
    const statusChanged = update.status && update.status !== order.status;
    if (statusChanged) {
      update.statusHistory = order.statusHistory || [];
      update.statusHistory.push({ step: update.status, date: new Date().toISOString() });
    }
    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: 'Order not found' });
    const updated = result.value;
    updated.id = updated._id.toString();
    delete updated._id;

    // Send status update email if status changed and email is available
    if (statusChanged && updated.shipping && updated.shipping.email) {
      try {
        const statusUpdateEmail = getOrderStatusUpdateTemplate(updated, update.status);
        await sendEmail({
          to: updated.shipping.email,
          subject: statusUpdateEmail.subject,
          text: statusUpdateEmail.text,
          html: statusUpdateEmail.html,
        });
        console.log(`Order status update email sent to ${updated.shipping.email}`);
      } catch (emailError) {
        console.error('Failed to send order status update email:', emailError.message);
        // Don't fail order update if email fails
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Mock Order Tracking Endpoint ---
app.get('/api/orders/track', async (req, res) => {
  const { order } = req.query;
  // Simple mock logic
  if (!order) {
    return res.status(400).json({ error: 'Order number or email required.' });
  }
  // Pretend we found the order
  if (order === '12345' || order === 'test@email.com') {
    return res.json({ status: 'Your order is on the way! Expected delivery: 2-3 days.' });
  }
  return res.status(404).json({ error: 'Order not found.' });
});

// --- Mock Contact Delivery Support Endpoint ---
app.post('/api/orders/contact', async (req, res) => {
  const { order, message } = req.body;
  if (!order || !message) {
    return res.status(400).json({ error: 'Order and message are required.' });
  }
  // Pretend to send message
  return res.json({ success: true, message: 'Your message has been sent to our delivery team.' });
});

// --- Mock Sales Analytics Endpoint ---
app.get('/api/sales/analytics', async (req, res) => {
  try {
    const db = await getDb();
    const { startDate, endDate } = req.query;
    let ordersQuery = {};
    if (startDate && endDate) {
      ordersQuery = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    const orders = await db.collection('orders').find(ordersQuery).toArray();
    if (orders.length > 0) {
      // Aggregate real sales data
      const totalSales = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      // Sales by product - only process orders with valid productIds
      const salesByProductMap = {};
      for (const o of orders) {
        // Skip orders without valid productId
        if (!o.productId || typeof o.productId !== 'string') continue;
        
        if (!salesByProductMap[o.productId]) {
          salesByProductMap[o.productId] = { sales: 0, revenue: 0 };
        }
        salesByProductMap[o.productId].sales += (o.quantity || 0);
        salesByProductMap[o.productId].revenue += (o.total || 0);
      }
      
      // Get product names - only for valid ObjectIds
      const validProductIds = Object.keys(salesByProductMap).filter(id => {
        // Check if string is a valid ObjectId format (24 hex characters)
        return /^[0-9a-fA-F]{24}$/.test(id);
      });
      
      const productObjectIds = validProductIds.map(id => new ObjectId(id));
      const products = productObjectIds.length > 0 
        ? await db.collection('products').find({ _id: { $in: productObjectIds } }).toArray()
        : [];
        
      const salesByProduct = products.map(p => ({
        name: p.name,
        sales: salesByProductMap[p._id.toString()].sales,
        revenue: salesByProductMap[p._id.toString()].revenue
      }));
      
      // Sales by category
      const salesByCategoryMap = {};
      for (const o of orders) {
        // Only process orders with valid productIds
        if (!o.productId || typeof o.productId !== 'string') continue;
        
        const product = products.find(p => p._id.toString() === o.productId?.toString());
        if (!product) continue;
        const cat = product.category;
        if (!salesByCategoryMap[cat]) salesByCategoryMap[cat] = { sales: 0, revenue: 0 };
        salesByCategoryMap[cat].sales += (o.quantity || 0);
        salesByCategoryMap[cat].revenue += (o.total || 0);
      }
      const salesByCategory = Object.entries(salesByCategoryMap).map(([category, data]) => ({
        category,
        sales: data.sales,
        revenue: data.revenue
      }));
      
      // Sales over time
      const salesOverTimeMap = {};
      for (const o of orders) {
        if (!o.date) continue; // Skip orders without dates
        const date = o.date.toISOString ? o.date.toISOString().slice(0, 10) : o.date.slice(0, 10);
        if (!salesOverTimeMap[date]) salesOverTimeMap[date] = { sales: 0, revenue: 0 };
        salesOverTimeMap[date].sales += (o.quantity || 0);
        salesOverTimeMap[date].revenue += (o.total || 0);
      }
      const salesOverTime = Object.entries(salesOverTimeMap).map(([date, data]) => ({
        date,
        sales: data.sales,
        revenue: data.revenue
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      return res.json({
        totalSales,
        totalRevenue,
        salesByCategory,
        salesByProduct,
        salesOverTime
      });
    }
  } catch (err) {
    console.error('Error in sales analytics:', err.message);
    // Return empty/default data structure on error to prevent crashes
    res.json({
      totalSales: 0,
      totalRevenue: 0,
      salesByCategory: [],
      salesByProduct: [],
      salesOverTime: []
    });
    return;
  }
  
  // Fallback to mock data if no orders
  let salesOverTime = [
    { date: '2024-06-01', sales: 40, revenue: 1600 },
    { date: '2024-06-02', sales: 55, revenue: 2200 },
    { date: '2024-06-03', sales: 60, revenue: 2400 },
    { date: '2024-06-04', sales: 70, revenue: 2800 },
    { date: '2024-06-05', sales: 80, revenue: 3200 },
    { date: '2024-06-06', sales: 90, revenue: 3600 },
    { date: '2024-06-07', sales: 100, revenue: 4000 }
  ];
  if (startDate && endDate) {
    salesOverTime = salesOverTime.filter(d => d.date >= startDate && d.date <= endDate);
  }
  res.json({
    totalSales: 1240,
    totalRevenue: 48250,
    salesByCategory: [
      { category: 'DRESSES', sales: 320, revenue: 12800 },
      { category: 'NURSING & POSTPARTUM', sales: 210, revenue: 9450 },
      { category: 'SHOP BY', sales: 400, revenue: 18000 },
      { category: 'SALE', sales: 310, revenue: 8000 }
    ],
    salesByProduct: [
      { name: 'Eden Knit Nursing Dress', sales: 120, revenue: 4800 },
      { name: 'Addison Nursing Knit', sales: 90, revenue: 3600 },
      { name: 'Theo Cosy Knit', sales: 70, revenue: 2800 },
      { name: 'Off-Shoulder Rib Top', sales: 60, revenue: 2400 }
    ],
    salesOverTime
  });
});


// --- Site Visits Endpoints ---
app.post('/api/visits', async (req, res) => {
  try {
    const db = await getDb();
    const visit = {
      timestamp: new Date(),
      ...req.body
    };
    await db.collection('visits').insertOne(visit);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/visits/count', async (req, res) => {
  try {
    const db = await getDb();
    const { startDate, endDate } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    const count = await db.collection('visits').countDocuments(query);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Contact Form ---
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const contactData = { name, email, phone, subject, message };
    
    // Send email to admin
    try {
      const adminEmail = getContactFormTemplate(contactData);
      await sendEmail({
        to: process.env.EMAIL_HOST_USER, // Send to the business email
        subject: adminEmail.subject,
        text: adminEmail.text,
        html: adminEmail.html,
      });
      
      // Send confirmation email to user
      const confirmationEmail = {
        subject: 'Thank you for contacting Everything Maternity',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <header style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #333; margin: 0;">Everything Maternity</h1>
              <h2 style="color: #666; margin: 10px 0 0 0;">Thank You for Contacting Us</h2>
            </header>
            
            <div style="padding: 20px;">
              <p>Dear ${name},</p>
              <p>Thank you for contacting Everything Maternity. We have received your message and will get back to you within 24 hours.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin: 0 0 10px 0;">Your Message:</h3>
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>

              <p>In the meantime, feel free to browse our latest collection or follow us on social media for updates and special offers.</p>
              
              <p>Best regards,<br>The Everything Maternity Team</p>
            </div>
            
            <footer style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p>&copy; 2024 Everything Maternity. All rights reserved.</p>
            </footer>
          </div>
        `,
        text: `
Thank you for contacting Everything Maternity

Dear ${name},

Thank you for contacting Everything Maternity. We have received your message and will get back to you within 24 hours.

Your Message:
${message}

In the meantime, feel free to browse our latest collection or follow us on social media for updates and special offers.

Best regards,
The Everything Maternity Team
        `
      };
      
      await sendEmail({
        to: email,
        subject: confirmationEmail.subject,
        text: confirmationEmail.text,
        html: confirmationEmail.html,
      });
      
      console.log(`Contact form emails sent successfully`);
      res.json({ success: true, message: 'Thank you for your message. We will get back to you soon!' });
    } catch (emailError) {
      console.error('Failed to send contact form emails:', emailError.message);
      res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Email Test Endpoint ---
app.post('/api/email/test', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'To, subject, and message are required' });
    }

    await sendEmail({
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    });
    
    res.json({ success: true, message: 'Test email sent successfully!' });
  } catch (err) {
    console.error('Failed to send test email:', err.message);
    res.status(500).json({ error: 'Failed to send test email: ' + err.message });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// Health check endpoint for Railway
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const db = await getDb();
    await db.admin().ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// For Vercel deployment, export the app instead of listening
if (!isVercel) {
  const PORT = process.env.PORT || 10000; // Render uses port 10000 by default
  const HOST = '0.0.0.0'; // Always bind to all interfaces for Render
  
  if (server) {
    server.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  } else {
    // For environments without Socket.IO
    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  }
}

// Export for Vercel
module.exports = app;

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}); 
