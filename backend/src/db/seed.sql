-- src/db/seed.sql

INSERT INTO products (name, sku, price, stock_quantity) VALUES 
('Mechanical Keyboard', 'SKU-KBD-001', 129.99, 50),
('Wireless Mouse', 'SKU-MSE-002', 59.99, 100),
('USB-C Hub', 'SKU-HUB-003', 35.50, 20);

INSERT INTO customers (name, email) VALUES 
('Alice Smith', 'alice@example.com'),
('Bob Jones', 'bob@example.com');