const db = require('../config/db');
const inventoryRepo = require('../repositories/inventoryRepository');

async function getInventory(req, res) {
    try {
        const client = await db.getClient();
        const products = await inventoryRepo.getAllProducts(client);
        client.release();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch inventory" });
    }
}

module.exports = { getInventory };