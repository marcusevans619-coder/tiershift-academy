CREATE TABLE demo_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  department text,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Allow anyone to insert (public form)
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit demo request"
ON demo_requests FOR INSERT
TO public
WITH CHECK (true);

-- Only you can read them
CREATE POLICY "Only authenticated users can view"
ON demo_requests FOR SELECT
TO authenticated
USING (true);
