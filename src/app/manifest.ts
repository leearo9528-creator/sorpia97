import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "소르피아97 동두천 애견카페",
    short_name: "소르피아97",
    description: "경기북부 5,000평 애견동반 카페 & 캠프닉 복합공간",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbfaee",
    theme_color: "#3a7a3f",
    icons: [
      { src: "/icon?size=192", sizes: "192x192", type: "image/png" },
      { src: "/icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
