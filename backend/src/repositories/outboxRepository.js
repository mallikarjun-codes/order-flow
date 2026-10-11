// src/repositories/outboxRepository.js

async function createOutboxEvent(client, eventType, payload) {
    const query = `
        INSERT INTO outbox_events (event_type, payload, status) 
        VALUES ($1, $2, 'pending');
    `;
    await client.query(query, [eventType, JSON.stringify(payload)]);
}

module.exports = { createOutboxEvent };