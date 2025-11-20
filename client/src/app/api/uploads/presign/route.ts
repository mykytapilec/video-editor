import { NextRequest, NextResponse } from "next/server";

interface PresignRequest {
  userId: string;
  fileNames: string[];
}

interface ExternalPresignResponse {
  fileName: string;
  filePath: string;
  contentType: string;
  presignedUrl: string;
  folder?: string;
  url: string;
}

interface ExternalPresignsResponse {
  uploads: ExternalPresignResponse[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PresignRequest = await request.json();
    const { userId, fileNames } = body;

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (!fileNames?.length) return NextResponse.json({ error: "fileNames array is required", status: 400 });

    let externalData: ExternalPresignsResponse | null = null;

    try {
      const externalResponse = await fetch(
        "https://upload-file-j43uyuaeza-uc.a.run.app/presigned",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, fileNames }),
        }
      );

      const text = await externalResponse.text();
      try {
        externalData = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: "External presign returned invalid JSON", details: text.slice(0, 200) },
          { status: externalResponse.status }
        );
      }

      if (!externalResponse.ok) {
        return NextResponse.json({ error: "External presign failed", details: externalData }, { status: externalResponse.status });
      }
    } catch (err) {
      return NextResponse.json({ error: "Failed to connect to external presign service", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }

    return NextResponse.json({ success: true, uploads: externalData?.uploads ?? [] });
  } catch (error) {
    console.error("Presign route error:", error);
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
