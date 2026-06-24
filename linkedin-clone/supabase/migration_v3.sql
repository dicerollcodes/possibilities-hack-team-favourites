-- ─────────────────────────────────────────────
-- LinkedIn Bounties — v3 migration: per-member bounty REVIEW status
-- Run this in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- Adds a `bounty_status` JSONB map to the `members` table:
--   { "<bounty_id>": "<status>" }
-- where <status> is one of:
--   'in_review'    submitted + made the top 10, awaiting the recruiter
--   'recruiter_ok' recruiter approved, awaiting an engineer
--   'awarded'      engineer approved → the verified badge is earned
--   'denied'       dropped by the recruiter or engineer
--
-- The demo user Panav (user_panav) is seeded with the LinkedIn city-search race
-- bounty as 'in_review'. The recruiter dashboard flips it to 'recruiter_ok' then
-- 'awarded' as Emily + an engineer approve; the candidate profile then unlocks
-- the verified badge.
-- ─────────────────────────────────────────────

-- 1. Make sure the members table exists (the live DB may only have bounties/jobs).
CREATE TABLE IF NOT EXISTS members (
  id                text PRIMARY KEY,
  name              text,
  school_history    jsonb NOT NULL DEFAULT '[]'::jsonb,
  job_history       jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_location  text,
  posts_activity    jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills            jsonb NOT NULL DEFAULT '[]'::jsonb,
  courses           jsonb NOT NULL DEFAULT '[]'::jsonb,
  bounty_status     jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- 2. ADD COLUMN (no-op if it already exists on a pre-existing members table)
ALTER TABLE members ADD COLUMN IF NOT EXISTS bounty_status jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 3. Migrate any legacy boolean values to the new string statuses.
--    Old shape: { "demo_google": true|false }. true → 'awarded', false is dropped
--    (it now means "not submitted", which is simply the absence of a key).
UPDATE members
SET bounty_status = (
  SELECT COALESCE(jsonb_object_agg(key, 'awarded'::jsonb), '{}'::jsonb)
  FROM jsonb_each(bounty_status)
  WHERE value = 'true'::jsonb
)
WHERE bounty_status::text LIKE '%true%' OR bounty_status::text LIKE '%false%';

-- 4. Make sure the demo user exists (the app also inserts this via REST).
INSERT INTO members (id, name, school_history, job_history, current_location, posts_activity, skills, courses, bounty_status)
SELECT 'user_panav', 'Panav Mhatre',
       '[{"degree":"Computer Science","school_name":"The University of Texas at Austin","graduation_year":2026}]'::jsonb,
       '[]'::jsonb,
       'Austin, Texas Metropolitan Area',
       '["Submitted a fix for the LinkedIn city-search race condition bounty — in review"]'::jsonb,
       '["JavaScript","Async/Concurrency","Debugging","React","Algorithms"]'::jsonb,
       '[]'::jsonb,
       '{"demo_li_race": "in_review"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM members WHERE id = 'user_panav');

-- 5. Seed the LinkedIn race bounty status to 'in_review' for Panav IF he has no
--    entry yet. (Does not overwrite an already-advanced 'recruiter_ok'/'awarded'.)
UPDATE members
SET bounty_status = bounty_status || '{"demo_li_race": "in_review"}'::jsonb
WHERE id = 'user_panav'
  AND NOT (bounty_status ? 'demo_li_race');

-- 6. RLS: allow public read + update of members (demo mode), so the app can
-- flip the status from the browser with the anon key. Re-runnable.
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_members"   ON members;
DROP POLICY IF EXISTS "public_update_members" ON members;
DROP POLICY IF EXISTS "public_insert_members" ON members;
CREATE POLICY "public_read_members"   ON members FOR SELECT USING (true);
CREATE POLICY "public_update_members" ON members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_insert_members" ON members FOR INSERT WITH CHECK (true);
