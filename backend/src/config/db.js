// src/config/db.js
require('dotenv').config();
const { Pool } = require('pg');

// Initialize the connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Neon serverless
    }
});

// Test the connection on startup
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect() // We need this specific function later for SQL Transactions
};