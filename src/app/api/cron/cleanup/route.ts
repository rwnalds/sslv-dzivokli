import { prisma } from "@/utils/get-prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Calculate the date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Delete listings older than 3 days that are not favorited
    const deletedCount = await prisma.foundListing.deleteMany({
      where: {
        foundAt: {
          lt: threeDaysAgo,
        },
        isFavorite: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount.count} old listings`,
      count: deletedCount.count,
    });
  } catch (error) {
    console.error("Error in cleanup:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to cleanup old listings",
      },
      { status: 500 }
    );
  }
}
