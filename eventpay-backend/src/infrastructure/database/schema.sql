CREATE TABLE IF NOT EXISTS payment_events (
    payment_id UUID NOT NULL,
    version INT NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (payment_id, version)
);

CREATE INDEX IF NOT EXISTS idx_payment_events_payment_id ON payment_events(payment_id);

CREATE TABLE IF NOT EXISTS webhook_outbox (
    id SERIAL PRIMARY KEY,
    payment_id UUID NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    attempts INT DEFAULT 0,
    next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_outbox_status_next_attempt ON webhook_outbox(status, next_attempt_at);
