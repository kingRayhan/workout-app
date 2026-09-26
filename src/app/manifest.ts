import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Workoutland",
    short_name: "Workoutland",
    description:
      "Mobile gym companion — catalog, daily todolist, and training Activity.",
    start_url: "/",
    display: "standalone",
    background_color: "#1c1c22",
    theme_color: "#1c1c22",
    orientation: "portrait",
    icons: [
      {
        src: "/icon/regular",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon/maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
