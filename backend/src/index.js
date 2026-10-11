// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); // Parses incoming JSON payloads

// Add these to src/index.js
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// Basic Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'OrderFlow API is running' });
});

// Add this in src/index.js (below app.use(express.json()); )
const { startWorker } = require('./workers/outboxRelay');

app.post('/api/mock-n8n', (req, res) => {
    console.log('\n--- 🎯 MOCK N8N RECEIVED WEBHOOK ---');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('-----------------------------------\n');
    res.status(200).send('OK');
});

// Start the Cron Worker (Add this right before app.listen)
startWorker();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

