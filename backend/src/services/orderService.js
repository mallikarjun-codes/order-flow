// src/services/orderService.js
const db = require('../config/db');
const inventoryRepo = require('../repositories/inventoryRepository');
const orderRepo = require('../repositories/orderRepository');
const outboxRepo = require('../repositories/outboxRepository');

async function processCheckout(customerId, items) {
    // 1. Acquire a dedicated client from the pool for the transaction
    const client = await db.getClient();
    
    try {
        // 2. Start the transaction
        await client.query('BEGIN');

        let totalAmount = 0;
        const processedItems = [];

        // 3. Process each item: Deduct inventory and calculate total
        for (const item of items) {
            const product = await inventoryRepo.deductInventory(client, item.productId, item.quantity);
            
            totalAmount += parseFloat(product.price) * item.quantity;
            processedItems.push({
                productId: item.productId,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });
        }

        // 4. Create the Order
        const orderId = await orderRepo.createOrder(client, customerId, totalAmount);

        // 5. Create the Order Items
        for (const item of processedItems) {
            await orderRepo.createOrderItem(client, orderId, item.productId, item.quantity, item.price);
        }

        // 6. Create the Outbox Event (for n8n to pick up later)
        const eventPayload = {
            orderId,
            customerId,
            totalAmount,
            items: processedItems
        };
        await outboxRepo.createOutboxEvent(client, 'ORDER_CREATED', eventPayload);

        // 7. Commit the transaction (Saves everything to the database permanently)
        await client.query('COMMIT');
        
        return { success: true, orderId, message: "Order placed successfully" };

    } catch (error) {
        // 8. If anything above failed, rollback all changes
        await client.query('ROLLBACK');
        throw error; // Throw to the controller
    } finally {
        // 9. ALWAYS release the client back to the pool, even if it crashed
        client.release();
    }
}

module.exports = { processCheckout };