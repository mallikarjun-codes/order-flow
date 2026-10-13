# 🚀 OrderFlow: Event-Driven E-Commerce Backend

A robust, fault-tolerant e-commerce backend built to demonstrate enterprise-grade system design, ACID-compliant database transactions, and decoupled event-driven automation. 

Unlike standard REST APIs, OrderFlow is architected to handle distributed system challenges like concurrency, network failures, and long-running third-party integrations without blocking the main event loop.

## 🏗️ System Architecture

OrderFlow utilizes the **Transactional Outbox Pattern** to decouple synchronous checkout operations from asynchronous fulfillment tasks (PDF generation, Email, Discord alerts).

```mermaid
sequenceDiagram
    participant Client as React Dashboard
    participant API as Node.js (Express)
    participant DB as PostgreSQL
    participant Cron as Node-Cron Worker
    participant n8n as n8n Automation
    
    Client->>API: POST /api/orders (Checkout)
    Note over API,DB: 🔒 BEGIN SQL TRANSACTION
    API->>DB: 1. Deduct Inventory (CHECK stock >= 0)
    API->>DB: 2. Create Order & Order Items
    API->>DB: 3. Insert into outbox_events (Status: Pending)
    Note over API,DB: 🔓 COMMIT TRANSACTION
    API-->>Client: 201 Success (Instant Response)
    
    loop Every 10 Seconds
        Cron->>DB: Fetch pending events (FOR UPDATE SKIP LOCKED)
        Cron->>n8n: POST Payload to Webhook
        n8n-->>Cron: 200 OK
        Cron->>DB: Mark event as 'Processed'
    end
    
    Note over n8n: Parallel Execution DAG
    n8n->>n8n: Branch 1: Send Discord Alert
    n8n->>n8n: Branch 2: Generate PDF Invoice -> Send Email