-- ─────────────────────────────────────────────
-- LinkedIn Bounties — full schema + seed data
-- Paste this entire file into the Supabase SQL Editor and run it.
-- ─────────────────────────────────────────────

-- 1. TABLES

CREATE TABLE IF NOT EXISTS bounties (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  company         text        NOT NULL,
  company_color   text        NOT NULL DEFAULT '#0a66c2',
  title           text        NOT NULL,
  category        text        NOT NULL DEFAULT 'Engineering',
  description     text        NOT NULL,
  submission_type text        NOT NULL DEFAULT 'github',
  deadline        date,
  submissions_count integer   NOT NULL DEFAULT 0,
  status          text        NOT NULL DEFAULT 'active',
  created_at      timestamptz DEFAULT now()
);

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
  bounty_id     uuid        REFERENCES bounties(id) ON DELETE SET NULL,
  submission_url text,
  ai_score      integer,
  ai_percentile text,
  ai_feedback   text,
  created_at    timestamptz DEFAULT now()
);

-- 2. ROW LEVEL SECURITY

ALTER TABLE bounties         ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions      ENABLE ROW LEVEL SECURITY;

-- Public can read everything (demo mode)
CREATE POLICY "public_read_bounties"         ON bounties         FOR SELECT USING (true);
CREATE POLICY "public_insert_bounties"       ON bounties         FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_candidates"       ON candidates       FOR SELECT USING (true);
CREATE POLICY "public_read_badges"           ON candidate_badges FOR SELECT USING (true);
CREATE POLICY "public_insert_submissions"    ON submissions      FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_submissions"      ON submissions      FOR SELECT USING (true);

-- Increment submissions_count when a new submission comes in
CREATE OR REPLACE FUNCTION increment_submissions_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.bounty_id IS NOT NULL THEN
    UPDATE bounties SET submissions_count = submissions_count + 1 WHERE id = NEW.bounty_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_submission_insert ON submissions;
CREATE TRIGGER on_submission_insert
  AFTER INSERT ON submissions
  FOR EACH ROW EXECUTE FUNCTION increment_submissions_count();

-- 3. SEED — bounties

INSERT INTO bounties (company, company_color, title, category, description, submission_type, deadline, submissions_count) VALUES
  ('LinkedIn',  '#0a66c2', 'Redesign Student Profile UX',           'Design',      'Improve the profile page experience for recent grads. Focus on skills showcase and first-job storytelling.',          'figma',    '2026-07-12', 34),
  ('Canva',     '#7c2ae8', 'Gen-Z Social Campaign Templates',       'Marketing',   'Create 5 Canva templates targeting college-age users for the back-to-school season. Must feel native to TikTok/IG.', 'figma',    '2026-07-18', 21),
  ('Fidelity',  '#538234', 'Retirement Savings Trend Analysis',     'Finance',     'Analyze Gen-Z retirement savings data and produce an actionable insights report with visualizations.',               'excel',    '2026-07-25', 19),
  ('Google',    '#4285f4', 'Fix the city-search race condition',     'Engineering', 'A real bug from our Search UX backlog: the city type-ahead shows results that do not match the search box because out-of-order async responses overwrite fresh ones. Diagnose and fix the autocomplete race in a live in-browser IDE.', 'github',   '2026-08-03', 12)
ON CONFLICT DO NOTHING;

-- 4. SEED — candidates + badges

WITH inserted_candidates AS (
  INSERT INTO candidates (name, school, avatar, avatar_bg, score, percentile) VALUES
    ('Alex Chen',       'UC Berkeley · CS Junior',  'AC', '#0a66c2', 94, 'Top 8%'),
    ('Priya Sharma',    'UT Austin · CS Senior',    'PS', '#7c2ae8', 91, 'Top 11%'),
    ('Marcus Johnson',  'Georgia Tech · CS Senior', 'MJ', '#059669', 88, 'Top 15%'),
    ('Sofia Rodriguez', 'Stanford · CS Sophomore',  'SR', '#f97316', 85, 'Top 20%'),
    ('David Kim',       'CMU · CS Junior',          'DK', '#e03e2d', 82, 'Top 24%')
  RETURNING id, name
)
INSERT INTO candidate_badges (candidate_id, company, company_color, task)
SELECT c.id, b.company, b.company_color, b.task FROM inserted_candidates c
JOIN (VALUES
  ('Alex Chen',       'LinkedIn', '#0a66c2', 'Redesigned student profile section'),
  ('Alex Chen',       'Fidelity', '#538234', 'Retirement trends analysis'),
  ('Priya Sharma',    'Canva',    '#7c2ae8', 'Student social media templates'),
  ('Priya Sharma',    'Google',   '#4285f4', 'URL shortener with analytics'),
  ('Marcus Johnson',  'LinkedIn', '#0a66c2', 'Student profile redesign'),
  ('Sofia Rodriguez', 'Canva',    '#7c2ae8', 'Gen-Z campaign strategy'),
  ('David Kim',       'Fidelity', '#538234', 'DCF valuation model')
) AS b(name, company, company_color, task) ON c.name = b.name;
