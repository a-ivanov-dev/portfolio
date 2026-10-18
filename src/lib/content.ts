import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

// Drafts show while previewing locally (npm run dev) but never on the live site.
const live = (e: { data: { draft: boolean } }) => !(import.meta.env.PROD && e.data.draft);

export async function getSite() {
  const site = await getEntry('site', 'home');
  if (!site) throw new Error('src/content/site/home.md is missing or one of its fields is invalid (see the messages above in the terminal). If you just changed fields, restart the preview.');
  return site;
}

export async function getCredentials() {
  return (await getCollection('credentials')).sort((a, b) => a.data.order - b.data.order);
}

// Newest first by date (and time, if the date includes one, e.g. 2026-10-17T14:35).
// Same moment -> higher code first (ENG-03 is newer than ENG-02); posts by title.
const newest = (a: { data: { date: Date } }, b: { data: { date: Date } }) => b.data.date.valueOf() - a.data.date.valueOf();

export async function getWork() {
  return (await getCollection('work', live)).sort((a, b) => newest(a, b) || b.data.code.localeCompare(a.data.code, undefined, { numeric: true }));
}

export async function getPosts() {
  return (await getCollection('blog', live)).sort((a, b) => newest(a, b) || a.data.title.localeCompare(b.data.title));
}

// Home page selection: pinned items first, then the newest, up to `limit`.
export function forHome<T extends { data: { pinned: boolean } }>(items: T[], limit: number): T[] {
  return [...items.filter((i) => i.data.pinned), ...items.filter((i) => !i.data.pinned)].slice(0, limit);
}

export async function getPages() {
  return getCollection('pages', live);
}

// Pages with "menu" ticked, in menuOrder.
export async function getMenuPages() {
  return (await getPages()).filter((p) => p.data.menu).sort((a, b) => a.data.menuOrder - b.data.menuOrder);
}

// A project gets its own page only when its Markdown file has a body below the frontmatter.
export const hasWriteup = (e: CollectionEntry<'work'>) => Boolean(e.body?.trim());

// "Active Directory" -> "active-directory" (used in the topic page address)
export const slugify = (t: string) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export type TopicInfo = { name: string; slug: string; count: number };

// Topics used by published projects and posts, most used first.
export async function getUsedTopics(): Promise<TopicInfo[]> {
  const byslug = new Map<string, TopicInfo>();
  for (const e of [...(await getWork()), ...(await getPosts())]) {
    for (const name of e.data.topics) {
      const slug = slugify(name);
      const t = byslug.get(slug) ?? { name, slug, count: 0 };
      t.count++;
      byslug.set(slug, t);
    }
  }
  return [...byslug.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// "2026 — 10" style used in lists, "2026–10" in writeup meta.
export const ym = (d: Date, sep = ' — ') => `${d.getUTCFullYear()}${sep}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
