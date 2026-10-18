import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { STATUS } from './config';

// Every folder under src/content is one kind of content, edited in Obsidian.
// Files starting with "_" are ignored, and so is the _templates folder.
const md = (folder: string) => glob({ pattern: '**/[^_]*.md', base: `./src/content/${folder}` });

const topic = z.string();                  // free text, e.g. "Active Directory"
const status = z.enum(Object.keys(STATUS) as [string, ...string[]]);

// site/home.md — name, links and other site-wide text; its body is the home page summary.
const site = defineCollection({
  loader: glob({ pattern: 'home.md', base: './src/content/site' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    siteTitle: z.string(),                  // browser tab / search result title of the home page
    roles: z.array(z.string()),            // focus areas under your name, e.g. Security Operations
    rolesStacked: z.boolean().default(true), // true = one per line, false = one line with dots
    heroLine: z.string(),
    location: z.string(),
    blurb: z.string(),
    description: z.string(),                // search engine / link preview description
    email: z.string(),
    github: z.string(),
    linkedin: z.string(),
    contact: z.string(),
    shareImage: image().optional(),         // link-preview picture (LinkedIn etc.), 1200×627 works best
    homeWork: z.number().default(4),        // how many writeups the home page shows
    homeBlog: z.number().default(3),        // how many blog posts the home page shows
    skyTopics: z.number().default(8),       // maximum topic labels in the star sky (most used first)
    listPageSize: z.number().default(10),   // items per page on the full Work and Blog lists
  }),
});

// credentials/*.md — one note per certification.
const credentials = defineCollection({
  loader: md('credentials'),
  schema: z.object({
    name: z.string(),
    domain: z.string(),
    target: z.string(),
    status,
    order: z.number(),                      // position in the table, 1 = first
  }),
});

const work = defineCollection({
  loader: md('work'),
  schema: ({ image }) => z.object({
    code: z.string(),                       // e.g. ENG-04
    title: z.string(),
    date: z.coerce.date(),
    status,
    summary: z.string(),                    // card text + LinkedIn post draft
    topics: z.array(topic).default([]),
    tags: z.array(z.string()).default([]),
    type: z.string().optional(),
    scope: z.string().optional(),
    cover: image().optional(),              // picture at the top + link-preview picture
    coverAlt: z.string().optional(),
    findings: z.object({
      crit: z.number().optional(), high: z.number().optional(),
      med: z.number().optional(), low: z.number().optional(),
    }).optional(),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    pinned: z.boolean().default(false),     // true = always on the home page, shown first
    draft: z.boolean().default(false),      // true = hidden on the live site
  }),
});

const blog = defineCollection({
  loader: md('blog'),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    topics: z.array(topic).default([]),
    tags: z.array(z.string()).default([]),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    pinned: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// pages/*.md — free-standing pages; pages/about.md becomes /about/
const pages = defineCollection({
  loader: md('pages'),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    menu: z.boolean().default(false),       // true = link in the site menu
    menuOrder: z.number().default(10),      // position among menu pages, 1 = first
    cover: image().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { site, credentials, work, blog, pages };
