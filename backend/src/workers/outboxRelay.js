const cron = require('node-cron');
const axios = require('axios');
const db = require('../config/db');
const outboxRepo = require('../repositories/outboxRepository');

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:3000/api/mock-n8n';

async function processOutbox() {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');

        const events = await outboxRepo.getPendingEvents(client, 10);

        if (events.length > 0) {
            console.log(`[Worker] Found ${events.length} pending events. Processing...`);
        }
        for (const event of events) {
            try {
                await axios.post(N8N_WEBHOOK_URL, {
                    eventId: event.id,
                    eventType: event.event_type,
                    payload: event.payload
                });

                await outboxRepo.markEventProcessed(client, event.id);
                console.log(`[Worker] Event ${event.id} sent to n8n and marked processed.`);

            } catch (err) {
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

function startWorker() {
    console.log('👷 Outbox Relay Worker started. Polling every 10 seconds...');
    cron.schedule('*/10 * * * * *', processOutbox);
}

module.exports = { startWorker };