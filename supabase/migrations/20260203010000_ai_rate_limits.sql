CREATE TABLE ai_rate_limits (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  request_count integer DEFAULT 0 NOT NULL,
  window_start timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only read their own limit status
CREATE POLICY "Users can read own rate limit" ON ai_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Atomic check-and-increment RPC function
-- Uses FOR UPDATE to prevent race conditions between concurrent requests
CREATE OR REPLACE FUNCTION check_ai_rate_limit(p_limit integer DEFAULT 10)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_window interval := interval '1 hour';
  v_current_count integer;
  v_window_start timestamptz;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Lock the row to prevent concurrent races
  SELECT request_count, window_start INTO v_current_count, v_window_start
  FROM ai_rate_limits WHERE user_id = v_user_id FOR UPDATE;

  -- First request ever → insert row
  IF NOT FOUND THEN
    INSERT INTO ai_rate_limits (user_id, request_count, window_start)
    VALUES (v_user_id, 1, v_now);
    RETURN true;
  END IF;

  -- Window expired → reset counter
  IF v_window_start + v_window < v_now THEN
    UPDATE ai_rate_limits SET request_count = 1, window_start = v_now
    WHERE user_id = v_user_id;
    RETURN true;
  END IF;

  -- At or over limit → deny (don't increment)
  IF v_current_count >= p_limit THEN
    RETURN false;
  END IF;

  -- Under limit → increment and allow
  UPDATE ai_rate_limits SET request_count = request_count + 1
  WHERE user_id = v_user_id;
  RETURN true;
END;
$$;
