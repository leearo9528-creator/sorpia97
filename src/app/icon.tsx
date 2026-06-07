import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const contentType = "image/png";

export default function Icon({ searchParams }: { searchParams?: { size?: string } }) {
  const size = parseInt(searchParams?.size ?? "512", 10);
  const radius = Math.round(size * 0.22);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#3a7a3f",
          borderRadius: radius,
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: Math.round(size * 0.55),
            fontWeight: 900,
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          S
        </span>
      </div>
    ),
    { width: size, height: size }
  );
}
