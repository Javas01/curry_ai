import { NextResponse } from "next/server";
import { getNextWarriorsGame } from "@/app/utils/scraper";

// Force this to run on the server
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  console.log("=== API ROUTE START ===");
  console.log("Server-side execution check:", process.version);

  try {
    console.log("API Route: Starting to fetch Warriors schedule...");
    const nextGame = await getNextWarriorsGame();
    console.log("API Route: Received next game data:", nextGame);
    console.log("=== API ROUTE END ===");
    return NextResponse.json({ nextGame });
  } catch (error) {
    console.error("=== API ROUTE ERROR ===");
    console.error("Full error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch schedule"
      },
      { status: 500 }
    );
  }
}
