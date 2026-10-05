import { reportError } from "../../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../../lib/server-auth";
const allowedTemplates = new Set([
  "benchmark-ai",
  ...Array.from({ length: 30 }, (_, i) => "free-" + String(i + 1).padStart(2, "0")),
]);
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params,
      { s, workspaceId } = await authContext(req);
    const { data, error } = await s
      .from("stores")
      .select(
        "id,name,slug,template_id,locale,status,settings,published_at,published_settings,published_name,published_locale,published_template_id,created_at,updated_at",
      )
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .single();
    if (error) throw error;
    return NextResponse.json({ store: data });
  } catch (e: any) {
    reportError(e, "api/stores/[id]");
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params,
      b = await req.json(),
      { s, workspaceId } = await authContext(req);
    const patch: any = { updated_at: new Date().toISOString() };
    if (typeof b.name === "string" && b.name.trim()) patch.name = b.name.trim().slice(0, 120);
    if (["darija", "ar", "fr"].includes(b.locale)) patch.locale = b.locale;
    if (allowedTemplates.has(b.templateId)) patch.template_id = b.templateId;
    if (b.settings && typeof b.settings === "object" && !Array.isArray(b.settings)) {
      const settings = structuredClone(b.settings);
      const uploadDataUrl = async (value: string, label: string) => {
        if (!value.startsWith("data:image/")) return value;
        const m = value.match(/^data:(image\/(?:jpeg|png|webp|avif|gif));base64,(.+)$/);
        if (!m) return value;
        const ext = m[1] === "image/jpeg" ? "jpg" : m[1].split("/")[1];
        const path = "stores/" + workspaceId + "/" + id + "/migrated-" + label + "-" + crypto.randomUUID() + "." + ext;
        const bytes = Uint8Array.from(Buffer.from(m[2], "base64"));
        const { error } = await s.storage
          .from("media")
          .upload(path, bytes, { contentType: m[1], cacheControl: "31536000", upsert: false });
        if (error) throw error;
        return s.storage.from("media").getPublicUrl(path).data.publicUrl;
      };
      if (settings.heroImage) settings.heroImage = await uploadDataUrl(String(settings.heroImage), "hero");
      if (settings.logo) settings.logo = await uploadDataUrl(String(settings.logo), "logo");
      if (settings.pageSections && typeof settings.pageSections === "object") {
        for (const [page, blocks] of Object.entries(settings.pageSections)) {
          if (!Array.isArray(blocks)) continue;
          for (let i = 0; i < blocks.length; i++) {
            const block: any = blocks[i];
            if (block?.image) block.image = await uploadDataUrl(String(block.image), page + "-" + i);
            if (Array.isArray(block?.images))
              block.images = await Promise.all(
                block.images.map((v: any, j: number) => uploadDataUrl(String(v), page + "-" + i + "-" + j)),
              );
          }
        }
      }
      patch.settings = settings;
    }
    if (["DRAFT", "PUBLISHED"].includes(b.status)) {
      patch.status = b.status;
      if (b.status === "PUBLISHED") {
        const { data: current, error: currentError } = await s
          .from("stores")
          .select("name,locale,template_id,settings")
          .eq("workspace_id", workspaceId)
          .eq("id", id)
          .single();
        if (currentError) throw currentError;
        patch.published_at = new Date().toISOString();
        patch.published_settings = patch.settings ?? current.settings ?? {};
        patch.published_name = patch.name ?? current.name;
        patch.published_locale = patch.locale ?? current.locale;
        patch.published_template_id = patch.template_id ?? current.template_id;
      } else patch.published_at = null;
    }
    const { data, error } = await s
      .from("stores")
      .update(patch)
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .select(
        "id,name,slug,template_id,locale,status,settings,published_at,published_settings,published_name,published_locale,published_template_id,created_at,updated_at",
      )
      .single();
    if (error) throw error;
    return NextResponse.json({ store: data });
  } catch (e: any) {
    reportError(e, "api/stores/[id]");
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params,
      { s, workspaceId } = await authContext(req);
    const { data: store, error: findError } = await s
      .from("stores")
      .select("id,name")
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .single();
    if (findError || !store) return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
    const { error } = await s.from("stores").delete().eq("workspace_id", workspaceId).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    reportError(e, "api/stores/[id]");
    return NextResponse.json({ error: e.message || "Suppression impossible" }, { status: 500 });
  }
}
