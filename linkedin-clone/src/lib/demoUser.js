import { supabase } from './supabase'

/* The demo user (Panav) is a real row in the live `members` table (id below).
   His per-bounty review status lives in a `bounty_status` JSONB column:
     { "<bounty_id>": "<status>" }
   where status is one of the REVIEW_STATUS values below. A bounty earns its
   verified badge ONLY once it reaches "awarded" — i.e. the candidate made the
   top 10 AND both the recruiter and an engineer approved the submission.

   These helpers degrade gracefully: if Supabase is unconfigured, or the
   `bounty_status` column hasn't been added yet (migration_v3.sql), reads return
   {} and writes no-op, so the UI still works on its in-memory state. */

export const DEMO_USER_ID = 'user_panav'
export const DEMO_USER_NAME = 'Panav Mhatre'

// Stable DB id for the LinkedIn "city-search race condition" coding bounty.
// The candidate app, the recruiter dashboard, and migration_v3 all key off this
// so a submission, its review, and the awarded badge all refer to the same row.
export const LI_RACE_BOUNTY_ID = 'demo_li_race'

// The review lifecycle. Order matters: each step gates the next.
export const REVIEW_STATUS = {
  IN_REVIEW: 'in_review',     // submitted + made top 10, awaiting the recruiter
  RECRUITER_OK: 'recruiter_ok', // recruiter approved, awaiting an engineer
  AWARDED: 'awarded',         // engineer approved → badge is verified
  DENIED: 'denied',           // dropped by recruiter or engineer
}

// Normalize a raw stored value into a status string (or null if not submitted).
// Tolerates the legacy boolean shape: true → awarded, false/absent → not started.
export function normalizeStatus(v) {
  if (v === true) return REVIEW_STATUS.AWARDED
  if (v === false || v == null) return null
  return String(v)
}

// True only when this bounty has cleared the full review loop.
export const isAwarded = (v) => normalizeStatus(v) === REVIEW_STATUS.AWARDED

// Read the demo user's bounty_status map. Returns {} on any failure.
export async function fetchBountyStatus() {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('bounty_status')
      .eq('id', DEMO_USER_ID)
      .single()
    if (error || !data) return {}
    return data.bounty_status ?? {}
  } catch {
    return {}
  }
}

// Set a bounty's review status for the demo user. Merges into the existing map
// so other bounties' statuses are preserved. Best-effort: returns the new map on
// success, or null if it couldn't persist (column missing, offline, etc).
export async function setBountyStatus(bountyId, status) {
  if (!bountyId || !status) return null
  try {
    const current = await fetchBountyStatus()
    const next = { ...current, [bountyId]: status }
    const { error } = await supabase
      .from('members')
      .update({ bounty_status: next })
      .eq('id', DEMO_USER_ID)
    if (error) return null
    return next
  } catch {
    return null
  }
}
