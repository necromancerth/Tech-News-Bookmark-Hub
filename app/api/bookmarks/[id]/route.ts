import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookmarkUpdateSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }
    return NextResponse.json(bookmark);
  } catch (error) {
    console.error("GET bookmark error:", error);
    return NextResponse.json({ error: "Failed to fetch bookmark" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const result = BookmarkUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: result.data,
      include: { category: true },
    });

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error("PATCH bookmark error:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.bookmark.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE bookmark error:", error);
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }
}
