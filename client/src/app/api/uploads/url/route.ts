import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:3001/uploads/url";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);

      const uploads = (json || []).map((u: any) => ({
        url: u.directUrl || u.url,
        fileName: u.fileName || u.name,
        provider: "external" as const,
      }));

      return NextResponse.json({ uploads }, { status: response.status });
    } catch {
      return NextResponse.json(
        {
          error: "External upload returned invalid JSON",
          details: text.substring(0, 200),
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: "URL Upload Route Error", details: err.message },
      { status: 500 }
    );
  }
}
