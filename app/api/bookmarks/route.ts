import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookmarkCreateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("GET bookmarks error:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = BookmarkCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check for duplicate URL
    const existing = await prisma.bookmark.findFirst({
      where: { url: data.url },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This article is already bookmarked" },
        { status: 409 }
      );
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        title: data.title,
        url: data.url,
        description: data.description,
        source: data.source,
        publishedAt: data.publishedAt,
        imageUrl: data.imageUrl || null,
        note: data.note,
        categoryId: data.categoryId || null,
      },
      include: { category: true },
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("POST bookmark error:", error);
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
  }
}
