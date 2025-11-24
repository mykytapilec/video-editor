import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { urls, userId } = await req.json();

    if (!urls?.length) {
      return NextResponse.json(
        { error: "No URLs provided" },
        { status: 400 }
      );
    }

    const uploads = urls.map((url: string) => ({
      url,
      fileName: url.split("/").pop()?.split("?")[0] || "file",
      provider: "external"
    }));

    return NextResponse.json({ uploads });
  } catch (error: any) {
    console.error("URL upload error:", error);

    return NextResponse.json(
      {
        error: "Invalid request"
      },
      { status: 500 }
    );
  }
}
