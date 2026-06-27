import { ImageResponse } from "@vercel/og"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title") ?? "DevPortfolio CMS"
  const description = searchParams.get("description") ?? "Developer Portfolio Content Management System"

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#f8fafc",
              margin: "0 0 24px",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontSize: "28px",
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.4,
                maxWidth: "600px",
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
