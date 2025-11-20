// app/api/opening/range/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "Opening hours are now managed in Sanity. Use contact settings data instead of this endpoint.",
    },
    { status: 410 }
  );
}
