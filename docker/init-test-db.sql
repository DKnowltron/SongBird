-- Create test database for vitest
SELECT 'CREATE DATABASE storyteller_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'storyteller_test')\gexec

GRANT ALL PRIVILEGES ON DATABASE storyteller_test TO storyteller;
