import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AetherAV CRM — The Enterprise CRM Built For AV Companies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#050505",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Gradient blobs */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(255,107,0,0.45) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -300,
            left: -100,
            width: 800,
            height: 800,
            background: "radial-gradient(circle, rgba(255,138,51,0.25) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #ff8a33 0%, #ff6b00 50%, #b34a00 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(255,107,0,0.6)",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                background: "#ffffff",
                clipPath:
                  "polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)",
              }}
            />
          </div>
          <div style={{ display: "flex", color: "#fff", fontSize: 26, fontWeight: 600, letterSpacing: -0.5 }}>
            Aether
            <span style={{ color: "#ff6b00" }}>AV</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            position: "relative",
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.05,
              letterSpacing: -2.5,
              maxWidth: 950,
            }}
          >
            The Enterprise CRM
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 700,
              background: "linear-gradient(135deg, #fff 0%, #ffd2b3 40%, #ff8a33 100%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.05,
              letterSpacing: -2.5,
              maxWidth: 950,
            }}
          >
            Built For AV Companies
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.55)",
              marginTop: 12,
              maxWidth: 900,
              lineHeight: 1.4,
              letterSpacing: -0.3,
            }}
          >
            Projects, clients, inventory, procurement, service, billing —
            and AV-specific tools no generic CRM ships with.
          </div>
        </div>

        {/* Tag chips */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
            position: "relative",
          }}
        >
          {["Rack Builder", "Signal Flow", "AI Proposals", "Service Desk"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(255,107,0,0.10)",
                border: "1px solid rgba(255,107,0,0.35)",
                color: "#ffaf66",
                fontSize: 18,
                fontWeight: 500,
                display: "flex",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
