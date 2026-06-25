CREATE TABLE IF NOT EXISTS payment_events (
    payment_id UUID NOT NULL,
    version INT NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (payment_id, version)
);

-- Index for quickly retrieving all events for a specific payment
CREATE INDEX IF NOT EXISTS idx_payment_events_payment_id ON payment_events(payment_id);
