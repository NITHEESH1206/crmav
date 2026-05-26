import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <span
          style={{
            color: "#ff5a1f",
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          AV
        </span>
      </div>
    ),
    { ...size }
  );
}
