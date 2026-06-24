-- ─────────────────────────────────────────────
-- LinkedIn Bounties — v2 migration (safe to re-run)
-- Run this in the Supabase SQL Editor.
-- The bounties table already exists with a different schema,
-- so we ADD columns instead of recreating it.
-- ─────────────────────────────────────────────

-- 1. ADD MISSING COLUMNS TO EXISTING bounties TABLE

ALTER TABLE bounties ADD COLUMN IF NOT EXISTS title           text;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS company_color   text        NOT NULL DEFAULT '#0a66c2';
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS category        text        NOT NULL DEFAULT 'Engineering';
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS submission_type text        NOT NULL DEFAULT 'github';
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS deadline        date;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS submissions_count integer   NOT NULL DEFAULT 0;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS status          text        NOT NULL DEFAULT 'active';
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS created_at      timestamptz DEFAULT now();

-- Backfill title from description (first sentence) for existing rows
UPDATE bounties SET title = split_part(description, '.', 1) WHERE title IS NULL;
ALTER TABLE bounties ALTER COLUMN title SET NOT NULL;

-- 2. CREATE NEW TABLES

CREATE TABLE IF NOT EXISTS candidates (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text    NOT NULL,
  school      text    NOT NULL,
  avatar      text    NOT NULL,
  avatar_bg   text    NOT NULL DEFAULT '#0a66c2',
  score       integer NOT NULL,
  percentile  text    NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidate_badges (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id  uuid REFERENCES candidates(id) ON DELETE CASCADE,
  company       text NOT NULL,
  company_color text NOT NULL,
  task          text NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  bounty_id     uuid,
  submission_url text,
  ai_score      integer,
  ai_percentile text,
  ai_feedback   text,
  created_at    timestamptz DEFAULT now()
);

-- 3. ROW LEVEL SECURITY

ALTER TABLE bounties         ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions      ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist, then recreate
DROP POLICY IF EXISTS "public_read_bounties"      ON bounties;
DROP POLICY IF EXISTS "public_insert_bounties"    ON bounties;
DROP POLICY IF EXISTS "public_read_candidates"    ON candidates;
DROP POLICY IF EXISTS "public_read_badges"        ON candidate_badges;
DROP POLICY IF EXISTS "public_insert_submissions" ON submissions;
DROP POLICY IF EXISTS "public_read_submissions"   ON submissions;

CREATE POLICY "public_read_bounties"      ON bounties         FOR SELECT USING (true);
CREATE POLICY "public_insert_bounties"    ON bounties         FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_candidates"    ON candidates       FOR SELECT USING (true);
CREATE POLICY "public_read_badges"        ON candidate_badges FOR SELECT USING (true);
CREATE POLICY "public_insert_submissions" ON submissions      FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_submissions"   ON submissions      FOR SELECT USING (true);

-- 4. SEED bounties (our 4 demo bounties — skip if already present by title)

INSERT INTO bounties (id, company, company_color, title, category, description, submission_type, deadline, submissions_count, status, potential_job_position, awardees, potential_job_ids)
SELECT * FROM (VALUES
  ('demo_linkedin',  'LinkedIn',  '#0a66c2', 'Redesign Student Profile UX',            'Design',      'Improve the profile page experience for recent grads. Focus on skills showcase and first-job storytelling.',          'figma',  '2026-07-12'::date, 34, 'active', 'Product Designer',    '[]'::jsonb, '[]'::jsonb),
  ('demo_canva',     'Canva',     '#7c2ae8', 'Gen-Z Social Campaign Templates',        'Marketing',   'Create 5 Canva templates targeting college-age users for the back-to-school season. Must feel native to TikTok/IG.', 'figma',  '2026-07-18'::date, 21, 'active', 'Marketing Specialist', '[]'::jsonb, '[]'::jsonb),
  ('demo_fidelity',  'Fidelity',  '#538234', 'Retirement Savings Trend Analysis',      'Finance',     'Analyze Gen-Z retirement savings data and produce an actionable insights report with visualizations.',               'excel',  '2026-07-25'::date, 19, 'active', 'Financial Analyst',   '[]'::jsonb, '[]'::jsonb),
  ('demo_google',    'Google',    '#4285f4', 'Fix the city-search race condition',     'Engineering', 'A real bug from our Search UX backlog. Our city type-ahead shows results that do not match the search box: type "london" quickly and the list ends up showing Los Angeles, Lagos, Lima — every city starting with "l" — instead of London. The cause is a classic autocomplete race: shorter queries come back slower, so an earlier keystroke''s response lands after a later one and overwrites the correct results. You get the live, reproducible bug in an in-browser IDE. Diagnose it, fix app.js so the rendered results always match the current input (no stale flicker), and ideally avoid hammering the API on every keystroke. AI assistance and docs are allowed — we grade the fix and your reasoning.', 'github', '2026-08-03'::date, 12, 'active', 'Software Engineer',   '[]'::jsonb, '[]'::jsonb)
) AS v(id, company, company_color, title, category, description, submission_type, deadline, submissions_count, status, potential_job_position, awardees, potential_job_ids)
WHERE NOT EXISTS (SELECT 1 FROM bounties WHERE title = v.title);

-- 4b. Migrate the Google demo bounty to the real SWE debugging ticket.
-- Safe to re-run: matches the existing demo_google row (or the old title) and
-- rewrites it in place so an already-seeded DB picks up the new problem.
UPDATE bounties SET
  title       = 'Fix the city-search race condition',
  category    = 'Engineering',
  description = 'A real bug from our Search UX backlog. Our city type-ahead shows results that do not match the search box: type "london" quickly and the list ends up showing Los Angeles, Lagos, Lima — every city starting with "l" — instead of London. The cause is a classic autocomplete race: shorter queries come back slower, so an earlier keystroke''s response lands after a later one and overwrites the correct results. You get the live, reproducible bug in an in-browser IDE. Diagnose it, fix app.js so the rendered results always match the current input (no stale flicker), and ideally avoid hammering the API on every keystroke. AI assistance and docs are allowed — we grade the fix and your reasoning.',
  submission_type = 'github'
WHERE id = 'demo_google' OR title = 'URL Shortener with Analytics Dashboard';

-- 5. SEED candidates + badges (skip if already present)

DO $$
DECLARE
  alex_id   uuid; priya_id uuid; marcus_id uuid; sofia_id uuid; david_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM candidates WHERE name = 'Alex Chen') THEN
    INSERT INTO candidates (name, school, avatar, avatar_bg, score, percentile) VALUES
      ('Alex Chen',       'UC Berkeley · CS Junior',  'AC', '#0a66c2', 94, 'Top 8%'),
      ('Priya Sharma',    'UT Austin · CS Senior',    'PS', '#7c2ae8', 91, 'Top 11%'),
      ('Marcus Johnson',  'Georgia Tech · CS Senior', 'MJ', '#059669', 88, 'Top 15%'),
      ('Sofia Rodriguez', 'Stanford · CS Sophomore',  'SR', '#f97316', 85, 'Top 20%'),
      ('David Kim',       'CMU · CS Junior',          'DK', '#e03e2d', 82, 'Top 24%');

    SELECT id INTO alex_id   FROM candidates WHERE name = 'Alex Chen';
    SELECT id INTO priya_id  FROM candidates WHERE name = 'Priya Sharma';
    SELECT id INTO marcus_id FROM candidates WHERE name = 'Marcus Johnson';
    SELECT id INTO sofia_id  FROM candidates WHERE name = 'Sofia Rodriguez';
    SELECT id INTO david_id  FROM candidates WHERE name = 'David Kim';

    INSERT INTO candidate_badges (candidate_id, company, company_color, task) VALUES
      (alex_id,   'LinkedIn', '#0a66c2', 'Redesigned student profile section'),
      (alex_id,   'Fidelity', '#538234', 'Retirement trends analysis'),
      (priya_id,  'Canva',    '#7c2ae8', 'Student social media templates'),
      (priya_id,  'Google',   '#4285f4', 'URL shortener with analytics'),
      (marcus_id, 'LinkedIn', '#0a66c2', 'Student profile redesign'),
      (sofia_id,  'Canva',    '#7c2ae8', 'Gen-Z campaign strategy'),
      (david_id,  'Fidelity', '#538234', 'DCF valuation model');
  END IF;
END $$;
