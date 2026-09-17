import { NextRequest, NextResponse } from "next/server";
import { generateDailyGrid, getNextGridNumber } from "@/lib/grid/generator";
import { auth } from "@/lib/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || !ADMIN_EMAIL || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { date } = body;

    // Parse date or use today
    const gridDate = date ? new Date(date) : new Date();
    gridDate.setHours(0, 0, 0, 0);

    // Get next grid number
    const gridNumber = await getNextGridNumber();

    // Generate the grid
    const grid = await generateDailyGrid(gridDate, gridNumber);

    return NextResponse.json({
      message: "Grid created successfully",
      grid,
    });
  } catch (error) {
    console.error("Error seeding grid:", error);
    return NextResponse.json(
      { error: "Failed to create grid" },
      { status: 500 }
    );
  }
}
