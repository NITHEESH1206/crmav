import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ZynexAV CRM — The Enterprise CRM Built For AV Companies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
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
            background: "radial-gradient(circle, rgba(255,90,31,0.45) 0%, transparent 70%)",
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
            background: "radial-gradient(circle, rgba(255,125,63,0.25) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Brand wordmark */}
        <div style={{ display: "flex", alignItems: "baseline", position: "relative" }}>
          <span
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: "#f4f2ec",
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            zynex
          </span>
          <span
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: "#ff5a1f",
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            AV
          </span>
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
              fontSize: 82,
              fontWeight: 800,
              color: "#f4f2ec",
              lineHeight: 1.02,
              letterSpacing: -3,
              maxWidth: 950,
            }}
          >
            The Enterprise CRM
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              background: "linear-gradient(135deg, #f4f2ec 0%, #ffd2b3 40%, #ff7d3f 100%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.02,
              letterSpacing: -3,
              maxWidth: 950,
            }}
          >
            Built For AV Companies
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(244,242,236,0.55)",
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
                background: "rgba(255,90,31,0.10)",
                border: "1px solid rgba(255,90,31,0.35)",
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
