import { NextRequest, NextResponse } from "next/server";

interface UploadUrlRequest {
  userId: string;
  urls: string[];
}

interface ExternalUploadResponse {
  fileName: string;
  filePath: string;
  contentType: string;
  originalUrl: string;
  folder?: string;
  url: string;
}

interface ExternalUploadsResponse {
  uploads: ExternalUploadResponse[];
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadUrlRequest = await request.json();
    const { userId, urls } = body;

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (!urls?.length) return NextResponse.json({ error: "urls array is required" }, { status: 400 });

    let externalData: ExternalUploadsResponse | null = null;

    try {
      const externalResponse = await fetch(
        "https://upload-file-j43uyuaeza-uc.a.run.app/url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, urls }),
        }
      );

      const text = await externalResponse.text();
      try {
        externalData = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: "External upload returned invalid JSON", details: text.slice(0, 200) },
          { status: externalResponse.status }
        );
      }

      if (!externalResponse.ok) {
        return NextResponse.json({ error: "External upload failed", details: externalData }, { status: externalResponse.status });
      }
    } catch (err) {
      return NextResponse.json({ error: "Failed to connect to external upload service", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }

    return NextResponse.json({ success: true, uploads: externalData?.uploads ?? [] });
  } catch (error) {
    console.error("Upload URL route error:", error);
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
