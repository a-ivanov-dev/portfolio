import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { TOPICS, STATUS } from './config';

// Files starting with "_" (like _template.md) are ignored.
const topic = z.enum(Object.keys(TOPICS) as [string, ...string[]]);
const status = z.enum(Object.keys(STATUS) as [string, ...string[]]);

const work = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/work' }),
  schema: z.object({
    code: z.string(),                       // e.g. ENG-01 — also sets the order on the page
    title: z.string(),
    date: z.coerce.date(),
    status,
    summary: z.string(),                    // card text + LinkedIn post draft
    topics: z.array(topic).default([]),
    tags: z.array(z.string()).default([]),
    type: z.string().optional(),            // e.g. Home lab, Detection engineering
    scope: z.string().optional(),           // e.g. 3 hosts
    findings: z.object({
      crit: z.number().optional(), high: z.number().optional(),
      med: z.number().optional(), low: z.number().optional(),
    }).optional(),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    draft: z.boolean().default(false),      // true = hidden on the live site
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    topics: z.array(topic).default([]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, blog };
