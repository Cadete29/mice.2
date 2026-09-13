BEGIN;
CREATE TABLE participant_email_batches (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES jornadas_limpieza_playas(id),
  created_by UUID NOT NULL REFERENCES usuarios(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE participant_email_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES participant_email_batches(id),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','failed','unknown')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(batch_id,email)
);
CREATE INDEX participant_email_pending ON participant_email_deliveries(status,updated_at);
COMMIT;
