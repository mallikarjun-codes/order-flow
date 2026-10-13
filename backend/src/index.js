require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); 
const { startWorker } = require('./workers/outboxRelay');

const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'OrderFlow API is running' });
});

app.post('/api/mock-n8n', (req, res) => {
    console.log('\n--- 🎯 MOCK N8N RECEIVED WEBHOOK ---');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('-----------------------------------\n');
    res.status(200).send('OK');
});

startWorker();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

