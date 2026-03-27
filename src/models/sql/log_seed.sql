-- Run once against an existing database if activity_log is missing 
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(120) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details TEXT
);
