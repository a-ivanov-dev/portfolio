import rss from '@astrojs/rss';
import { SITE } from '../config';
import { getWork, getPosts, hasWriteup } from '../lib/content';

// Feed of blog posts and finished writeups, newest first.
export async function GET(context) {
  const posts = (await getPosts()).map((p) => ({
    title: p.data.title, pubDate: p.data.date, description: p.data.summary, link: `/blog/${p.id}/`,
  }));
  const work = (await getWork()).filter(hasWriteup).map((w) => ({
    title: w.data.title, pubDate: w.data.date, description: w.data.summary, link: `/work/${w.id}/`,
  }));
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: [...posts, ...work].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
  });
}
