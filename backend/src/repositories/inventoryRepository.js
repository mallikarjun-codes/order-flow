// src/repositories/inventoryRepository.js

// Deducts stock and returns the product details if sufficient stock exists.
// Using a parameterized query ($1, $2) prevents SQL Injection.
async function deductInventory(client, productId, quantity) {
    const query = `
        UPDATE products 
        SET stock_quantity = stock_quantity - $1 
        WHERE id = $2 AND stock_quantity >= $1
        RETURNING id, name, price;
    `;
    const result = await client.query(query, [quantity, productId]);
    
    // If no rows are returned, it means either the product doesn't exist, 
    // or stock_quantity < quantity.
    if (result.rows.length === 0) {
        throw new Error(`Insufficient stock or invalid product for ID: ${productId}`);
    }
    return result.rows[0];
}

module.exports = { deductInventory };