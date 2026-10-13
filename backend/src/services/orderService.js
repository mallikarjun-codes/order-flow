const db = require('../config/db');
const inventoryRepo = require('../repositories/inventoryRepository');
const orderRepo = require('../repositories/orderRepository');
const outboxRepo = require('../repositories/outboxRepository');

async function processCheckout(customerId, items) {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');

        let totalAmount = 0;
        const processedItems = [];

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

        const orderId = await orderRepo.createOrder(client, customerId, totalAmount);


        for (const item of processedItems) {
            await orderRepo.createOrderItem(client, orderId, item.productId, item.quantity, item.price);
        }

        const eventPayload = {
            orderId,
            customerId,
            totalAmount,
            items: processedItems
        };
        await outboxRepo.createOutboxEvent(client, 'ORDER_CREATED', eventPayload);

        await client.query('COMMIT');
        
        return { success: true, orderId, message: "Order placed successfully" };

    } catch (error) {        await client.query('ROLLBACK');
        throw error; 
    } finally {
        client.release();
    }
}

module.exports = { processCheckout };