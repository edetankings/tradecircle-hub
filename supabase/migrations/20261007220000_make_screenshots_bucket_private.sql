UPDATE storage.buckets
SET public = false
WHERE id = 'screenshots';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'screenshots'
      AND public = false
  ) THEN
    RAISE EXCEPTION 'The screenshots bucket must exist and be private';
  END IF;
END;
$$;
