import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { loadGroup, loadMembers } from "@/lib/group";
import { groupIdFrom } from "@/lib/slug";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Invitation à une sortie sur Buddly";

/** Aperçu affiché dans WhatsApp, iMessage, Messenger… quand on partage le lien d'une sortie. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const id = groupIdFrom((await params).id);
  let name = "Une sortie entre potes";
  let when = "";
  let area = "";
  let host = "";
  try {
    const g = await loadGroup(id);
    if (g) {
      name = g.name;
      when = g.when;
      area = g.area.split(",")[0];
      host = (await loadMembers(id))[0]?.name ?? "";
    }
  } catch {}

  const bud = await readFile(join(process.cwd(), "public/pet-love.png"));
  const fredoka = await readFile(join(process.cwd(), "app/fonts/fredoka-bold.ttf"));
  const budSrc = `data:image/png;base64,${bud.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #fdf7fb 0%, #efe5fd 100%)",
          fontFamily: "Fredoka",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: -120, top: -120, width: 520, height: 520, borderRadius: 999, background: "#e2d3fc", display: "flex" }} />
        <div style={{ position: "absolute", left: -80, bottom: -160, width: 420, height: 320, borderRadius: 999, background: "#c9b3ff", opacity: 0.6, display: "flex" }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 80px", width: 760 }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#8b55e3", display: "flex" }}>Buddly</div>
          <div style={{ fontSize: 34, color: "#6e6280", marginTop: 26, display: "flex" }}>
            {host ? `${host} t'invite à` : "Tu es invité·e à"}
          </div>
          <div style={{ fontSize: name.length > 26 ? 58 : 76, fontWeight: 800, color: "#2a1548", lineHeight: 1.05, marginTop: 8, display: "flex" }}>{name}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
            {when && (
              <div style={{ display: "flex", alignItems: "center", height: 64, whiteSpace: "nowrap", fontSize: 28, padding: "0 28px", borderRadius: 999, background: "#f7806a", color: "#fff" }}>
                {when}
              </div>
            )}
            {area && (
              <div style={{ display: "flex", alignItems: "center", height: 64, whiteSpace: "nowrap", fontSize: 28, padding: "0 28px", borderRadius: 999, background: "#fff", color: "#43207a" }}>
                {area}
              </div>
            )}
          </div>
          <div style={{ fontSize: 28, color: "#6e6280", marginTop: 34, display: "flex" }}>Tu swipes, Bud garde ce qui plaît à tout le monde.</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <img src={budSrc} width={360} height={385} alt="" />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Fredoka", data: fredoka, weight: 700, style: "normal" }] },
  );
}
