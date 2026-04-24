import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategoryUpdateSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const result = CategoryUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: result.data,
      include: { _count: { select: { bookmarks: true } } },
    });

    return NextResponse.json(category);
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
    console.error("PUT category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Unlink bookmarks from this category before deleting
    await prisma.bookmark.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
