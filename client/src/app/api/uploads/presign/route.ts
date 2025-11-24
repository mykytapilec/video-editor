import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:3001/uploads/presign";

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
      return NextResponse.json(json, { status: response.status });
    } catch (e) {
      return NextResponse.json(
        {
          error: "Invalid JSON returned from backend",
          details: text.substring(0, 200),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Presign route error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
