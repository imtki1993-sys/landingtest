import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("public order endpoint keeps COD anti-spam and published-page guards", async () => {
  const source = await read("app/api/orders/route.ts");
  assert.match(source, /check_public_order_rate_limit/);
  assert.match(source, /capture_public_order/);
  assert.match(source, /PUBLISHED/);
  assert.match(source, /12/);
  assert.match(source, /600/);
});

test("Ozon cron stays protected and uses the delivery job queue", async () => {
  const source = await read("app/api/cron/ozon-sync/route.ts");
  assert.match(source, /CRON_SECRET/);
  assert.match(source, /enqueue_delivery_sync_job/);
  assert.match(source, /claim_delivery_sync_jobs/);
});

test("landing publication keeps versioned publishing and cache invalidation", async () => {
  const source = await read("app/api/pages/[id]/route.ts");
  assert.match(source, /publish_landing_page_update/);
  assert.match(source, /revalidateTag/);
  assert.match(source, /PUBLISHED/);
});

test("analytics endpoint stays workspace-authenticated and aggregated server-side", async () => {
  const source = await read("app/api/analytics/route.ts");
  assert.match(source, /authContext/);
  assert.match(source, /analytics_dashboard_aggregate/);
  assert.match(source, /workspaceId/);
});

test("public tracking only accepts the expected analytics events", async () => {
  const source = await read("app/api/track/route.ts");
  for (const event of ["page_view","cta_click","whatsapp_click","form_start","form_submit","scroll_50","scroll_100"]) {
    assert.match(source, new RegExp(event));
  }
});
