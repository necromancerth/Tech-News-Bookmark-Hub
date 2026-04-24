import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategoryCreateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { bookmarks: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CategoryCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: result.data,
      include: { _count: { select: { bookmarks: true } } },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }
    console.error("POST category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
