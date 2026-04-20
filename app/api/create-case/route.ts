import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const firstUser = await prisma.user.findFirst({
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (!firstUser) {
      return NextResponse.json(
        {
          success: false,
          error: "No user exists yet. Create a user first.",
        },
        { status: 400 }
      );
    }

    const newCase = await prisma.case.create({
      data: {
        title: "Untitled Case",
        caseType: "MEDICAL",
        description: "",
        subjectName: "",
        owner: {
          connect: { id: firstUser.id },
        },
      },
    });

    return NextResponse.json({
      success: true,
      case: {
        id: newCase.id,
      },
    });
  } catch (error) {
    console.error("Create case error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create case",
      },
      { status: 500 }
    );
  }
}