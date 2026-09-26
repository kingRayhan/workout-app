import { ImageResponse } from "next/og";

export const contentType = "image/png";

export function generateImageMetadata() {
  return [
    {
      id: "regular",
      size: { width: 512, height: 512 },
    },
    {
      id: "maskable",
      size: { width: 512, height: 512 },
    },
  ];
}

export default async function Icon({
  id,
}: {
  id: Promise<string | number>;
}) {
  const variant = await id;
  const maskable = variant === "maskable";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1c22",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: maskable ? 256 : 320,
            height: maskable ? 256 : 320,
            borderRadius: maskable ? 48 : 64,
            background: "#7ed321",
            fontSize: maskable ? 176 : 220,
            fontWeight: 700,
            color: "#1c1c22",
            fontFamily: "sans-serif",
          }}
        >
          W
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
