// src/repositories/outboxRepository.js

async function createOutboxEvent(client, eventType, payload) {
    const query = `
        INSERT INTO outbox_events (event_type, payload, status) 
        VALUES ($1, $2, 'pending');
    `;
    await client.query(query, [eventType, JSON.stringify(payload)]);
}

// Add these to src/repositories/outboxRepository.js

// Fetches pending events and LOCKS them so other instances don't grab them
async function getPendingEvents(client, limit = 10) {
    const query = `
        SELECT * FROM outbox_events 
        WHERE status = 'pending' 
        ORDER BY created_at ASC 
        LIMIT $1 
        FOR UPDATE SKIP LOCKED;
    `;
    const result = await client.query(query, [limit]);
    return result.rows;
}

async function markEventProcessed(client, eventId) {
    const query = `
        UPDATE outbox_events 
        SET status = 'processed' 
        WHERE id = $1;
    `;
    await client.query(query, [eventId]);
}

module.exports = { createOutboxEvent, getPendingEvents, markEventProcessed };