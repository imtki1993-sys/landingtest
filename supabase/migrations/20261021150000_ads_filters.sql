-- Analyse des pubs v2 : filtres (période, landing page), dépense par période, noms lisibles,
-- et provenance retrouvée pour les commandes passées avant la v1.
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.

-- 1. Rapport filtrable par période et par landing page
drop function if exists public.ads_report(uuid);
create or replace function public.ads_report(
  p_workspace_id uuid,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_landing_page_id uuid default null
)
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
      and (p_from is null or ord.created_at >= p_from)
      and (p_to is null or ord.created_at < p_to)
      and (p_landing_page_id is null or ord.landing_page_id = p_landing_page_id)
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
      and (p_from is null or e.occurred_at >= p_from)
      and (p_to is null or e.occurred_at < p_to)
      and (p_landing_page_id is null or e.landing_page_id = p_landing_page_id)
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
revoke all on function public.ads_report(uuid, timestamptz, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.ads_report(uuid, timestamptz, timestamptz, uuid) to service_role;

-- 2. Dépense saisie pour une période (vide = toute la durée de la campagne)
alter table public.ad_spend add column if not exists period_from date;
alter table public.ad_spend add column if not exists period_to date;
alter table public.ad_spend drop constraint if exists ad_spend_pkey;
create unique index if not exists ad_spend_period_uidx
  on public.ad_spend (workspace_id, campaign, coalesce(period_from, '1970-01-01'::date), coalesce(period_to, '1970-01-01'::date));

-- 3. Nom lisible donné par le vendeur à une campagne / pub (quand la pub envoie un numéro)
create table if not exists public.ad_labels (
  workspace_id uuid not null,
  campaign text not null,
  label text not null,
  primary key (workspace_id, campaign)
);
alter table public.ad_labels enable row level security;

-- 4. Commandes passées avant la v1 : provenance reprise de l'envoi du formulaire enregistré
--    sur la même landing au même moment (événement form_submit, qui porte les UTM de la visite)
update public.orders o
   set utm_source = m.utm_source, utm_medium = m.utm_medium, utm_campaign = m.utm_campaign,
       utm_term = m.utm_term, utm_content = m.utm_content
  from (
    select distinct on (o2.id) o2.id, e.utm_source, e.utm_medium, e.utm_campaign, e.utm_term, e.utm_content
      from public.orders o2
      join public.analytics_events e
        on e.workspace_id = o2.workspace_id
       and e.landing_page_id = o2.landing_page_id
       and lower(e.event::text) = 'form_submit'
       and nullif(trim(e.utm_campaign), '') is not null
       and e.occurred_at between o2.created_at - interval '5 minutes' and o2.created_at + interval '1 minute'
     where o2.utm_campaign is null
     order by o2.id, abs(extract(epoch from (e.occurred_at - o2.created_at)))
  ) m
 where o.id = m.id;

notify pgrst, 'reload schema';
