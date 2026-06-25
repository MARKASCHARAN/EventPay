# 💳 EventPay — Event-Driven Payment & Webhook Reliability Platform  
### *Fintech-Grade • Idempotent APIs • Immutable Event Store • Production-Ready*

![Node.js](https://img.shields.io/badge/Runtime-Node.js-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)
![Express](https://img.shields.io/badge/API-Express-black?logo=express)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)
![Webhooks](https://img.shields.io/badge/Architecture-Event_Driven-orange)
![Testing](https://img.shields.io/badge/Testing-Jest-red)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Overview

**EventPay** is a **Stripe-inspired payment backend system** focused on **correctness, reliability, and failure safety**.  
Instead of UI-heavy demos, EventPay models how **real fintech systems** are built and reasoned about.

The system demonstrates:
- Deterministic payment state transitions  
- Immutable, append-only event sourcing  
- Idempotent APIs for safe retries  
- Production-grade webhook delivery  
- Failure-first engineering and observability  

> This project is built to mirror **real-world payment infrastructure**, not toy examples.

---

## 🎯 Why EventPay Exists

Payment systems operate in unreliable environments:
- Network failures  
- Client retries  
- Partial database commits  
- Webhook endpoint downtime  

**EventPay guarantees correctness even under repeated failures.**

---

## ✨ Core Guarantees

| Guarantee | Implementation |
|---------|----------------|
| Correct payment lifecycle | Strict Finite State Machine |
| Full audit trail | Immutable event store |
| Safe retries | Idempotency keys + request hashing |
| Webhook reliability | At-least-once delivery + retries |
| Failure tolerance | Retry queues + DLQ |
| Observability | Structured logs + metrics |

---

## 🏗️ Architecture

**Modular Monolith (Enterprise-Preferred)**

src/
 ├── domain/          # Pure business logic (FSM, entities)
 ├── application/     # Use cases and orchestration
 ├── infrastructure/  # DB, queues, external systems
 ├── api/             # REST controllers and Idempotency
 ├── workers/         # Async webhook processors with DLQ
 └── tests/           # Unit, integration, failure tests
```

---

## 🚀 Quick Start

1. **Start the Infrastructure (PostgreSQL 15):**
   ```bash
   cd eventpay-backend
   docker-compose up -d
   ```

2. **Install & Run the Backend:**
   ```bash
   npm install
   npm run dev
   ```

3. **Run the End-to-End Demo Script:**
   In a new terminal window, watch the system in action:
   ```bash
   npm run demo
   ```
   *This script simulates a client creating, authorizing, and capturing a payment, while simultaneously spinning up a local webhook receiver to catch the dispatched events from the background worker.*

##  Key Features

---

###   Payment State Machine (FSM)

Payments follow a strict lifecycle:

INITIATED → AUTHORIZED → CAPTURED
↘ FAILED
CAPTURED → REFUNDED


**Rules**
- No skipped states  
- No backward transitions  
- One event = one state change  

Illegal transitions are explicitly rejected to ensure **financial correctness**.

---

###  Immutable Event Store (Event Sourcing)

All payment changes are stored as append-only events.


```mermaid

flowchart TD
    A["Client / Merchant"] --> B["REST API<br/>Express + TypeScript"]
    B --> C["Application Layer<br/>Use Cases"]
    C --> D["Domain Layer<br/>FSM + Events"]
    D --> E["PostgreSQL<br/>Immutable Event Store"]
    D --> F["Webhook Dispatcher"]
    F --> G["Retry Queue<br/>Backoff + DLQ"]
    G --> H["Merchant Webhook Endpoint"]
```

## License

MIT License © 2026 EventPay