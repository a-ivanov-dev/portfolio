# aleksandrivanov.com

Personal site, built with [Astro](https://astro.build) and deployed by Cloudflare Pages on every push to `main`.

## Editing content (Obsidian)

Open `src/content` as an Obsidian vault (Open folder as vault). Everything you edit day to day is a note there:

| What | Note |
|---|---|
| Name, links, role line, contact text, link-preview picture | `site/home.md` (Properties) |
| Summary on the home page | `site/home.md` (text of the note) |
| Credentials table | `credentials/*.md`, one note per cert |
| Projects / writeups | `work/*.md` |
| Blog posts | `blog/*.md` |
| Extra pages (`about.md` -> `/about/`) | `pages/*.md` |
| Templates (Obsidian core Templates plugin) | `_templates/` |

Pictures pasted into a note are saved in an `images` folder next to it and optimised by Astro.
A project with an empty body shows only as a card; text below its properties becomes a page at `/work/<file-name>/`.
`draft: true` hides a note on the live site but shows it in the local preview.

Topics (star labels) and tags are free text typed in each note. Code-level settings (rarely changed): status values in `src/config.ts`, design in `src/styles/global.css`, star sky and theme toggle in `public/scripts/`, security headers in `public/_headers`.

## Preview and publish

```
./scripts/preview.sh    # live site at http://localhost:4321 while you edit (Ctrl+C to stop)
./scripts/publish.sh    # privacy check + offline test build + commit + push
```

## Local preview (Podman, rootless; Node is never installed on the host)

```
podman run --rm -it -v ~/portfolio:/app:Z -w /app -p 127.0.0.1:4321:4321 docker.io/library/node:22-slim bash
npm ci          # first time / after dependency changes
npm run dev     # open http://localhost:4321
```

git commands and the GitHub login stay on the host, never inside the container.
