-- Allow unauthenticated (anon) users to view quotes that have been sent or paid.
-- This supports the public quote page at /q/{id} without requiring the service role key.
-- Draft quotes remain invisible to anon users — only the owner can see them.

create policy "Anyone can view sent and paid quotes"
  on quotes for select
  using (status in ('sent', 'paid'));
