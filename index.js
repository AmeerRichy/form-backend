const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const Form = require('./models/Form');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve index.html + submissions.html

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// Form Submission Route
app.post('/api/forms', async (req, res) => {
  const { name, email, message } = req.body;
  console.log('Form Data:', req.body);

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required.' });
  }

  try {
    const newForm = new Form({ name, email, message });
    const saved = await newForm.save();
    console.log('Saved to DB ✅', saved);
    res.status(201).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('❌ Error submitting form:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Submissions Fetch Route
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error('Error fetching forms:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
