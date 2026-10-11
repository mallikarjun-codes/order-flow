// src/repositories/orderRepository.js

async function createOrder(client, customerId, totalAmount) {
    const query = `
        INSERT INTO orders (customer_id, total_amount, status) 
        VALUES ($1, $2, 'paid') 
        RETURNING id;
    `;
    const result = await client.query(query, [customerId, totalAmount]);
    return result.rows[0].id;
}

async function createOrderItem(client, orderId, productId, quantity, priceAtPurchase) {
    const query = `
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) 
        VALUES ($1, $2, $3, $4);
    `;
    await client.query(query, [orderId, productId, quantity, priceAtPurchase]);
}

module.exports = { createOrder, createOrderItem };