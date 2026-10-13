const { processCheckout } = require('../services/orderService');

async function createOrder(req, res) {
    try {
        const { customerId, items } = req.body;

        if (!customerId || !items || items.length === 0) {
            return res.status(400).json({ error: "Invalid request payload" });
        }

        const result = await processCheckout(customerId, items);
        res.status(201).json(result);
        
    } catch (error) {
        console.error("Checkout Error:", error.message);
        res.status(400).json({ error: error.message });
    }
}

module.exports = { createOrder };