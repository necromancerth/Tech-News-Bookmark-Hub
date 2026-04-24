export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { bookmarks: number };
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  source: string;
  publishedAt?: string | null;
  imageUrl?: string | null;
  note?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
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

export type FeedType = "top" | "new" | "best";
