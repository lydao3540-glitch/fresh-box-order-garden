-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users can read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Shop owner (verified email) becomes admin automatically
create or replace function public.grant_owner_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null and lower(new.email) in ('lamhuyentham1205@gmail.com') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_owner_admin
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.grant_owner_admin();

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  note text,
  payment_method text not null check (payment_method in ('cod', 'bank')),
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','shipping','delivered','cancelled')),
  items jsonb not null,
  total_quantity integer not null check (total_quantity > 0),
  total integer not null check (total >= 0),
  email_status text not null default 'pending',
  email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_at_idx on public.orders (created_at desc);

grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

create policy "Admins can read orders" on public.orders
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update orders" on public.orders
  for update to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger orders_touch_updated_at before update on public.orders
  for each row execute function public.touch_updated_at();