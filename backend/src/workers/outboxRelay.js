// src/workers/outboxRelay.js
const cron = require('node-cron');
const axios = require('axios');
const db = require('../config/db');
const outboxRepo = require('../repositories/outboxRepository');

// Note: In Phase 4, you will replace this with your actual n8n Webhook URL.
// For now, we use a dummy endpoint to test the logic.
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:3000/api/mock-n8n'; 

async function processOutbox() {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');

        // 1. Fetch pending events (with row locks)
        const events = await outboxRepo.getPendingEvents(client, 10);

        if (events.length > 0) {
            console.log(`[Worker] Found ${events.length} pending events. Processing...`);
        }

        // 2. Process each event
        for (const event of events) {
            try {
                // Attempt to send data to n8n
                await axios.post(N8N_WEBHOOK_URL, {
                    eventId: event.id,
                    eventType: event.event_type,
                    payload: event.payload
                });

                // If axios succeeds, mark as processed in the database
                await outboxRepo.markEventProcessed(client, event.id);
                console.log(`[Worker] Event ${event.id} sent to n8n and marked processed.`);

            } catch (err) {
                // If n8n is down or network fails, we just log the error.
                // We DO NOT mark it as processed. It stays 'pending' and we try again next time.
                console.error(`[Worker] Failed to send Event ${event.id} to n8n:`, err.message);
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[Worker] Outbox processing transaction failed:', error.message);
    } finally {
        client.release();
    }
}

// Start the cron job to run every 10 seconds
function startWorker() {
    console.log('👷 Outbox Relay Worker started. Polling every 10 seconds...');
    cron.schedule('*/10 * * * * *', processOutbox);
}

module.exports = { startWorker };