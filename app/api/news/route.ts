import { NextRequest, NextResponse } from "next/server";
import {
  fetchTopStoryIds,
  fetchNewStoryIds,
  fetchBestStoryIds,
  fetchStories,
} from "@/lib/hn-api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "top";
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 50);

  try {
    let ids: number[];
    if (type === "new") {
      ids = await fetchNewStoryIds(limit);
    } else if (type === "best") {
      ids = await fetchBestStoryIds(limit);
    } else {
      ids = await fetchTopStoryIds(limit);
    }

    const stories = await fetchStories(ids);
    return NextResponse.json({ stories, type, total: stories.length });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
