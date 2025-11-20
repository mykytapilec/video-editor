// client/src/app/api/uploads/url/route.ts
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

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Call external upload service
    let externalData: ExternalUploadsResponse | null = null;

    try {
      const externalResponse = await fetch(
        "https://upload-file-j43uyuaeza-uc.a.run.app/url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId,
            urls
          })
        }
      );

      // Try to parse JSON, but catch HTML / 500 responses
      const text = await externalResponse.text();
      try {
        externalData = JSON.parse(text);
      } catch {
        return NextResponse.json(
          {
            error: "External upload service returned invalid JSON",
            details: text.slice(0, 200) // first 200 chars for debugging
          },
          { status: externalResponse.status }
        );
      }

      if (!externalResponse.ok) {
        return NextResponse.json(
          {
            error: "External upload service failed",
            details: externalData
          },
          { status: externalResponse.status }
        );
      }
    } catch (err) {
      return NextResponse.json(
        {
          error: "Failed to connect to external upload service",
          details: err instanceof Error ? err.message : String(err)
        },
        { status: 500 }
      );
    }

    const { uploads = [] } = externalData || {};

    return NextResponse.json({
      success: true,
      uploads
    });
  } catch (error) {
    console.error("Error in upload URL route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
