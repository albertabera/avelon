-- 1. Create Profiles Table (Public info for users)
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  primary key (id)
);

-- 2. Create Subscriptions Table (Premium status)
create table public.subscriptions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('active', 'cancelled', 'expired')),
  plan_type text default 'premium_lifetime',
  valid_until timestamptz, -- NULL means lifetime
  created_at timestamptz default now(),
  primary key (id)
);

-- 3. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;

-- 4. Policies (Who can see what)
-- Profiles: Everyone can read their own profile.
create policy "Users can view own profile" 
on public.profiles for select 
using ( auth.uid() = id );

create policy "Users can update own profile" 
on public.profiles for update 
using ( auth.uid() = id );

-- Subscriptions: Users can read their own subscription. 
-- Only the Service Role (backend/admin) can create/update subscriptions.
create policy "Users can view own subscription" 
on public.subscriptions for select 
using ( auth.uid() = user_id );

-- 5. Trigger: Automatically create a profile when a new User signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Helper Function: Grant Premium (For Manual Testing in SQL Editor)
-- Usage: select grant_premium('user_email@example.com');
create or replace function public.grant_premium(target_email text)
returns text as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where email = target_email;
  
  if target_id is null then
    return 'User not found';
  end if;

  insert into public.subscriptions (user_id, status, plan_type)
  values (target_id, 'active', 'premium_lifetime')
  on conflict do nothing; -- Simplification: In reality you might update existing

  return 'Premium granted to ' || target_email;
end;
$$ language plpgsql security definer;
