// client/src/app/api/groups/[id]/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

const API_URL = "http://localhost:3001";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await axios.get(`${API_URL}/groups/${params.id}`);
    return NextResponse.json(res.data);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to fetch group", details: e.message },
      { status: 500 }
    );
  }
}
