# aleksandrivanov.com

Personal site, built with [Astro](https://astro.build) and deployed by Cloudflare Pages on every push to `main`.

## Where things live

| What | File |
|---|---|
| Name, links, role line, contact text, credentials table | `src/config.ts` |
| Summary paragraphs | `src/data/summary.md` |
| Projects / writeups (one file each) | `src/content/work/*.md` |
| Blog posts (one file each) | `src/content/blog/*.md` |
| Templates to copy | `src/content/work/_template.md`, `src/content/blog/_template.md` |
| Images for writeups | `public/images/` |
| Design (colours, fonts, layout) | `src/styles/global.css` |
| Star sky + theme toggle | `public/scripts/` |
| Security headers | `public/_headers` |

A project with an empty body shows only as a card. Text below its frontmatter becomes a writeup page at `/work/<file-name>/`.
`draft: true` hides a file on the live site but shows it in the local preview.

## Local preview (Podman, rootless; Node is never installed on the host)

```
podman run --rm -it -v ~/portfolio:/app:Z -w /app -p 127.0.0.1:4321:4321 docker.io/library/node:22-slim bash
npm ci          # first time / after dependency changes
npm run dev     # open http://localhost:4321
```

git commands and the GitHub login stay on the host, never inside the container.
