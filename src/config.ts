// Structural settings that rarely change.
// Everyday text (name, links, summary, credentials, posts, pages) lives in src/content
// and is edited in Obsidian.

// Topics (the small star labels) are free text, typed in each note's "topics" field,
// e.g. "Active Directory". Each topic used by a published note gets a star label
// and a page at /topics/<topic-in-lowercase-with-dashes>/.

// Allowed values for "status" on projects and credentials, and the chip they show.
export const STATUS = {
  planned: { label: 'Planned', chip: 'plan' },
  'in-progress': { label: 'In progress', chip: 'wip' },
  complete: { label: 'Complete', chip: 'done' },
} as const;
