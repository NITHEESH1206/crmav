import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AetherAV CRM",
    short_name: "AetherAV",
    description: "The Enterprise CRM Built For AV Companies",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#ff6b00",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
    ],
  };
}
