-- Affiliate link configurations
-- Stores templates for wrapping URLs with affiliate tags
CREATE TABLE affiliate_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source content_source NOT NULL,
  domain_pattern TEXT NOT NULL,
  affiliate_tag TEXT NOT NULL,
  url_template TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example: youtube.com links get ?tag=storyteller-20 appended
-- url_template uses {url} and {tag} placeholders
CREATE UNIQUE INDEX idx_affiliate_configs_domain ON affiliate_configs(domain_pattern);
