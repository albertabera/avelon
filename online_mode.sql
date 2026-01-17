-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create ROOMS Table
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  host_id uuid, -- Can be null or link to auth.users if Anon Auth is used
  status text default 'LOBBY', -- 'LOBBY', 'PLAYING', 'FINISHED'
  game_state jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create PLAYERS Table
create table public.players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  name text not null,
  role text, -- 'MERLIN', 'ASSASSIN', etc. (Null initially)
  is_host boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Realtime for these tables
-- This allows clients to subscribe to changes (INSERT, UPDATE, DELETE)
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;

-- 4. Row Level Security (RLS)
-- For a frictionless "No Login" experience, we will allow public access.
-- Ideally, you should enable Anonymous Auth in Supabase and use policies checking auth.uid().
-- For this MVP, we will start with open access to ensure it works immediately.

alter table public.rooms enable row level security;
alter table public.players enable row level security;

-- Policy: Allow ANONYMOUS/PUBLIC access (Create, Read, Update)
create policy "Allow Public Access to Rooms"
on public.rooms for all
using (true)
with check (true);

create policy "Allow Public Access to Players"
on public.players for all
using (true)
with check (true);

-- 5. Cleanup Function (Optional but recommended)
-- Delete rooms older than 24 hours to keep DB clean
create or replace function delete_old_rooms() returns void as $$
begin
  delete from public.rooms where created_at < now() - interval '24 hours';
end;
$$ language plpgsql;
