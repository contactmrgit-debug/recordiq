import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cases = await prisma.case.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        caseType: true,
        createdAt: true,
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      cases: cases.map((caseItem) => ({
        id: caseItem.id,
        title: caseItem.title,
        caseType: caseItem.caseType,
        createdAt: caseItem.createdAt,
        documentCount: caseItem._count.documents,
      })),
    });
  } catch (error) {
    console.error("GET /api/cases error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load cases" },
      { status: 500 }
    );
  }
}

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
          error: "No user found in database. Create a user first.",
        },
        { status: 400 }
      );
    }

    const newCase = await prisma.case.create({
      data: {
        title: "Untitled Case",
        caseType: "MEDICAL",
        ownerId: firstUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      case: newCase,
    });
  } catch (error) {
    console.error("CREATE CASE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create case",
      },
      { status: 500 }
    );
  }
}
