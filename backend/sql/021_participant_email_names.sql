BEGIN;
ALTER TABLE participant_email_deliveries ADD COLUMN recipient_name TEXT;
COMMIT;
