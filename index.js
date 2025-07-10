const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const Form = require('./models/Form');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ CORS Fix for OPTIONS preflight
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Handle OPTIONS preflight
app.options('*', cors());

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend files if any

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// ✅ Routes

// POST: Receive form data
app.post('/api/forms', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required.' });
  }

  try {
    const newForm = new Form({ name, email, message });
    await newForm.save();
    console.log('✅ Saved to DB:', newForm);
    res.status(201).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('❌ Error submitting form:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: Return all form data
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('✅ Form Backend Running');
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
