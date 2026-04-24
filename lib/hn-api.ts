const BASE_URL = "https://hacker-news.firebaseio.com/v0";

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
  descendants?: number;
  type: string;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  description: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  score?: number;
  author?: string;
  comments?: number;
}

export async function fetchTopStoryIds(limit = 30): Promise<number[]> {
  const res = await fetch(`${BASE_URL}/topstories.json`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch top stories");
  const ids: number[] = await res.json();
  return ids.slice(0, limit);
}

export async function fetchNewStoryIds(limit = 30): Promise<number[]> {
  const res = await fetch(`${BASE_URL}/newstories.json`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch new stories");
  const ids: number[] = await res.json();
  return ids.slice(0, limit);
}

export async function fetchBestStoryIds(limit = 30): Promise<number[]> {
  const res = await fetch(`${BASE_URL}/beststories.json`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch best stories");
  const ids: number[] = await res.json();
  return ids.slice(0, limit);
}

export async function fetchStory(id: number): Promise<HNStory | null> {
  try {
    const res = await fetch(`${BASE_URL}/item/${id}.json`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchStories(ids: number[]): Promise<NewsItem[]> {
  const stories = await Promise.all(ids.map((id) => fetchStory(id)));
  return stories
    .filter((s): s is HNStory => s !== null && s.type === "story" && !!s.title)
    .map((s) => ({
      id: String(s.id),
      title: s.title,
      url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
      description: `Posted by ${s.by} • ${s.score} points • ${s.descendants ?? 0} comments`,
      source: "Hacker News",
      publishedAt: new Date(s.time * 1000).toISOString(),
      author: s.by,
      score: s.score,
      comments: s.descendants ?? 0,
    }));
}
