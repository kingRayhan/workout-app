import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            width: 120,
            height: 120,
            borderRadius: 26,
            background: "#7ed321",
            fontSize: 82,
            fontWeight: 700,
            color: "#1c1c22",
            fontFamily: "sans-serif",
          }}
        >
          W
        </div>
      </div>
    ),
    { ...size },
  );
}
