-- Analyse des pubs : provenance de chaque commande (paramètres UTM de la pub) et dépense pub par campagne.
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.

-- 1. Provenance enregistrée sur la commande (rempli par /api/orders à partir de l'URL de la landing)
alter table public.orders add column if not exists utm_source text;
alter table public.orders add column if not exists utm_medium text;
alter table public.orders add column if not exists utm_campaign text;
alter table public.orders add column if not exists utm_term text;     -- ensemble de pubs
alter table public.orders add column if not exists utm_content text;  -- pub
create index if not exists orders_ws_campaign_idx on public.orders (workspace_id, utm_campaign);
create index if not exists analytics_events_ws_campaign_idx on public.analytics_events (workspace_id, utm_campaign);

-- 2. Dépense pub saisie par le vendeur (montant total dépensé sur la campagne, comme dans Ads Manager)
create table if not exists public.ad_spend (
  workspace_id uuid not null,
  campaign text not null,
  amount numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, campaign)
);
alter table public.ad_spend enable row level security;  -- lu et écrit seulement par le serveur (clé secrète)

-- 3. Rapport par campagne / ensemble de pubs / pub : visites, commandes, confirmées, livrées, retours, CA livré
create or replace function public.ads_report(p_workspace_id uuid)
returns table (
  campaign text,
  adset text,
  ad text,
  visits bigint,
  orders bigint,
  confirmed bigint,
  delivered bigint,
  returned bigint,
  cancelled bigint,
  revenue numeric,
  delivered_revenue numeric
)
language sql
stable
as $$
  with o as (
    select
      coalesce(trim(ord.utm_campaign), '') as campaign,
      coalesce(trim(ord.utm_term), '') as adset,
      coalesce(trim(ord.utm_content), '') as ad,
      coalesce(ord.total, 0) as total,
      coalesce(ord.shipment_status::text, '') as ship,
      coalesce(l.status::text, 'NEW') as lead
    from public.orders ord
    left join public.leads l on l.id = ord.lead_id
    where ord.workspace_id = p_workspace_id
  ),
  oa as (
    select campaign, adset, ad,
      count(*) as orders,
      count(*) filter (where lead in ('CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURNED')
        or ship in ('PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNING', 'RETURNED', 'FAILED')) as confirmed,
      count(*) filter (where ship = 'DELIVERED' or lead = 'DELIVERED') as delivered,
      count(*) filter (where ship in ('RETURNING', 'RETURNED', 'FAILED') or lead = 'RETURNED') as returned,
      count(*) filter (where lead = 'CANCELLED' and ship not in ('DELIVERED', 'RETURNING', 'RETURNED', 'FAILED')) as cancelled,
      sum(total) as revenue,
      sum(total) filter (where ship = 'DELIVERED' or lead = 'DELIVERED') as delivered_revenue
    from o
    group by campaign, adset, ad
  ),
  va as (
    select
      trim(e.utm_campaign) as campaign,
      coalesce(trim(e.utm_term), '') as adset,
      coalesce(trim(e.utm_content), '') as ad,
      count(distinct e.session_id) + count(*) filter (where e.session_id is null) as visits
    from public.analytics_events e
    where e.workspace_id = p_workspace_id
      and lower(e.event::text) = 'page_view'
      and nullif(trim(e.utm_campaign), '') is not null
    group by 1, 2, 3
  )
  -- clé vide = pas renseignée (commande sans pub identifiée, ou pub sans ensemble / nom)
  select
    nullif(coalesce(oa.campaign, va.campaign), ''),
    nullif(coalesce(oa.adset, va.adset), ''),
    nullif(coalesce(oa.ad, va.ad), ''),
    coalesce(va.visits, 0),
    coalesce(oa.orders, 0),
    coalesce(oa.confirmed, 0),
    coalesce(oa.delivered, 0),
    coalesce(oa.returned, 0),
    coalesce(oa.cancelled, 0),
    coalesce(oa.revenue, 0),
    coalesce(oa.delivered_revenue, 0)
  from oa
  full join va on oa.campaign = va.campaign and oa.adset = va.adset and oa.ad = va.ad;
$$;

-- Jamais appelable depuis le navigateur : seulement par le serveur (service_role)
revoke all on function public.ads_report(uuid) from public, anon, authenticated;
grant execute on function public.ads_report(uuid) to service_role;

notify pgrst, 'reload schema';
