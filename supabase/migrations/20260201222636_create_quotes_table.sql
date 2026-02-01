-- Create quotes table
create table quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_name text not null,
  client_email text,
  job_description text not null,
  line_items jsonb default '[]',
  total_cents integer default 0,
  status text default 'draft' check (status in ('draft', 'sent', 'paid')),
  stripe_session_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table quotes enable row level security;

-- Policy: Users can only access their own quotes
create policy "Users can view own quotes"
  on quotes for select
  using (auth.uid() = user_id);

create policy "Users can insert own quotes"
  on quotes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own quotes"
  on quotes for update
  using (auth.uid() = user_id);

create policy "Users can delete own quotes"
  on quotes for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_quotes_updated_at
  before update on quotes
  for each row
  execute function update_updated_at_column();
