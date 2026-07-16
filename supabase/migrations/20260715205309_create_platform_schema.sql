/*
# منصة العربية ببساطة — Schema Setup

## Overview
Creates the data model for the "العربية ببساطة" educational platform.
This is a single-tenant, no-Supabase-Auth app: the teacher manages students
who log in with a phone number + password stored in the students table.
The frontend uses the anon key, so all policies allow `anon, authenticated`.

## New Tables
1. `students`
   - `id` (uuid, PK)
   - `name` (text) — full name of the student (البطل)
   - `phone` (text, unique) — login username
   - `password` (text) — plain-text login password (managed by teacher)
   - `grade` (text) — '1g' | '2g' | '3g' (الإعدادي grades)
   - `points` (int, default 0) — gamification score
   - `is_online` (boolean, default false) — presence flag
   - `created_at` (timestamptz)

2. `lessons`
   - `id` (uuid, PK)
   - `title` (text)
   - `grade` (text) — target grade
   - `type` (text) — 'video' | 'interactive'
   - `video` (text) — video URL (YouTube/Drive)
   - `interactive_html` (text) — HTML payload for interactive lessons
   - `pdf` (text) — optional PDF URL
   - `quiz_id` (text) — optional linked quiz id (loose reference, not FK to keep deletes simple)
   - `points` (int, default 10) — points awarded on quiz success
   - `created_at` (timestamptz)

3. `quizzes`
   - `id` (uuid, PK)
   - `title` (text)
   - `questions` (jsonb) — array of {q, a, b, c, correct}
   - `created_at` (timestamptz)

4. `notifications`
   - `id` (uuid, PK)
   - `title` (text)
   - `body` (text)
   - `created_at` (timestamptz)

## Security
- RLS enabled on every table.
- All four CRUD policies per table scoped `TO anon, authenticated` with
  `USING (true)` / `WITH CHECK (true)` because the data is intentionally
  shared across the single-tenant app (no per-user ownership via auth.uid).
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  password text NOT NULL,
  grade text NOT NULL DEFAULT '1g',
  points int NOT NULL DEFAULT 0,
  is_online boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  grade text NOT NULL DEFAULT '1g',
  type text NOT NULL DEFAULT 'video',
  video text NOT NULL DEFAULT '',
  interactive_html text NOT NULL DEFAULT '',
  pdf text NOT NULL DEFAULT '',
  quiz_id text NOT NULL DEFAULT '',
  points int NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_students_points ON students(points DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_grade ON lessons(grade);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ===== RLS: students =====
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);

-- ===== RLS: lessons =====
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lessons" ON lessons;
CREATE POLICY "anon_select_lessons" ON lessons FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lessons" ON lessons;
CREATE POLICY "anon_insert_lessons" ON lessons FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_lessons" ON lessons;
CREATE POLICY "anon_update_lessons" ON lessons FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_lessons" ON lessons;
CREATE POLICY "anon_delete_lessons" ON lessons FOR DELETE
  TO anon, authenticated USING (true);

-- ===== RLS: quizzes =====
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quizzes" ON quizzes;
CREATE POLICY "anon_select_quizzes" ON quizzes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quizzes" ON quizzes;
CREATE POLICY "anon_insert_quizzes" ON quizzes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quizzes" ON quizzes;
CREATE POLICY "anon_update_quizzes" ON quizzes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quizzes" ON quizzes;
CREATE POLICY "anon_delete_quizzes" ON quizzes FOR DELETE
  TO anon, authenticated USING (true);

-- ===== RLS: notifications =====
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE
  TO anon, authenticated USING (true);
