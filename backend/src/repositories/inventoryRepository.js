async function deductInventory(client, productId, quantity) {
    const query = `
        UPDATE products 
        SET stock_quantity = stock_quantity - $1 
        WHERE id = $2 AND stock_quantity >= $1
        RETURNING id, name, price;
    `;
    const result = await client.query(query, [quantity, productId]);

    if (result.rows.length === 0) {
        throw new Error(`Insufficient stock or invalid product for ID: ${productId}`);
    }
    return result.rows[0];
}

async function getAllProducts(client) {
    const query = `SELECT id, name, sku, price, stock_quantity FROM products ORDER BY id ASC;`;
    const result = await client.query(query);
    return result.rows;
}

module.exports = { deductInventory, getAllProducts };