import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZynexAV CRM",
    short_name: "ZynexAV",
    description: "The Enterprise CRM Built For AV Companies",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#ff5a1f",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
    ],
  };
}
