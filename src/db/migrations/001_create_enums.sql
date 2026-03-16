CREATE TYPE source_type AS ENUM ('artist_recording', 'ai_generated', 'archival_compilation');
CREATE TYPE story_status AS ENUM ('draft', 'published', 'verified', 'rejected');
CREATE TYPE partner_status AS ENUM ('active', 'inactive', 'onboarding');
CREATE TYPE distribution_status AS ENUM ('pending', 'delivered', 'acknowledged', 'failed');
