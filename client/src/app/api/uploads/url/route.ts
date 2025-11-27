import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Missing URL in request body" },
        { status: 400 }
      );
    }

    const uploadedItem = {
      id: nanoid(),
      originalUrl: url,
      uploadedUrl: url,
      status: "success",
    };

    return NextResponse.json({ uploads: [uploadedItem] });
  } catch (err) {
    console.error("Error in upload route:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
