import { getCollection, type CollectionEntry } from 'astro:content';
import { TOPICS, type Topic } from '../config';

// Drafts show while previewing locally (npm run dev) but never on the live site.
const live = (e: { data: { draft: boolean } }) => !(import.meta.env.PROD && e.data.draft);

export async function getWork() {
  return (await getCollection('work', live)).sort((a, b) => a.data.code.localeCompare(b.data.code));
}

export async function getPosts() {
  return (await getCollection('blog', live)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// A project gets its own page only when its Markdown file has a body below the frontmatter.
export const hasWriteup = (e: CollectionEntry<'work'>) => Boolean(e.body?.trim());

// Topics used by at least one published project or post, in the order of TOPICS.
export async function getUsedTopics(): Promise<Topic[]> {
  const used = new Set([...(await getWork()), ...(await getPosts())].flatMap((e) => e.data.topics));
  return (Object.keys(TOPICS) as Topic[]).filter((t) => used.has(t));
}

// "2026 — 10" style used in lists, "2026–10" in writeup meta.
export const ym = (d: Date, sep = ' — ') => `${d.getUTCFullYear()}${sep}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
