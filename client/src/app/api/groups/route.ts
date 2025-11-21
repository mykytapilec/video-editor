// client/src/app/api/groups/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

const API_URL = "http://localhost:3001";

export async function GET() {
  try {
    const res = await axios.get(`${API_URL}/groups`);
    return NextResponse.json(res.data);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to fetch groups", details: e.message },
      { status: 500 }
    );
  }
}
