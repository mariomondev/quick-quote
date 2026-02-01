-- Enhance RLS policies with explicit null checks for better security
-- This ensures policies explicitly check for authenticated users

-- Drop existing policies
drop policy if exists "Users can view own quotes" on quotes;
drop policy if exists "Users can insert own quotes" on quotes;
drop policy if exists "Users can update own quotes" on quotes;
drop policy if exists "Users can delete own quotes" on quotes;

-- Recreate policies with explicit null checks
create policy "Users can view own quotes"
  on quotes for select
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can insert own quotes"
  on quotes for insert
  with check (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can update own quotes"
  on quotes for update
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can delete own quotes"
  on quotes for delete
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);
