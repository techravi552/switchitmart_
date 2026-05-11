const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimit');

dotenv.config();
const app = express();
connectDB();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://switchitmart-dez6yav93-switchit.vercel.app',  // ← आपका Vercel URL (deploy के बाद update करें)
    /\.vercel\.app$/                 // सभी Vercel subdomains allow
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true, limit:'10mb' }));
app.use('/uploads', express.static(path.join(__dirname,'uploads')));
app.use('/api', apiLimiter);

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/seller',        require('./routes/seller'));
app.use('/api/buyer',         require('./routes/buyer'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/chat',          require('./routes/chat'));
app.use('/api/support',       require('./routes/support'));
app.use('/api/payment',       require('./routes/payment'));

app.get('/api/health', (_,res) => res.json({ status:'OK', version:'3.0' }));
app.use((err,_req,res,_next) => { console.error(err.stack); res.status(500).json({ message:'Server error', error:err.message }); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 LocalKart v3 on port ${PORT}`));


console.log("MONGO_URI =", process.env.MONGO_URI);