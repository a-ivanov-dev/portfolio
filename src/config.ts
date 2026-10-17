// EDIT HERE: personal details and site-wide text. Used on every page.
export const SITE = {
  name: 'Aleksandr Ivanov',
  role: 'Security Operations · Cloud Security · Networking',
  heroLine: 'Security Operations',
  location: 'Las Vegas, NV',
  blurb: 'I build networks, attack them in my own lab, and write the detections that would have caught me.',
  description: 'Aleksandr Ivanov — security operations, cloud security and networking. Home-lab projects and detections, written up in full.',
  email: 'hello@aleksandrivanov.com',
  github: 'https://github.com/a-ivanov-dev',
  linkedin: 'https://www.linkedin.com/in/aleksandr-ivanov-a0841525b',
  contact: 'Open to SOC analyst and security operations roles. Happy to walk through any project above in detail, including what I got wrong the first time.',
};

// Topics: the small labels in the star sky. A label only appears once at least
// one published project or post uses that topic. Keys are used in frontmatter.
export const TOPICS = {
  'active-directory': 'Active Directory',
  'entra-id': 'Entra ID',
  network: 'Network',
  detection: 'Detection',
  cloud: 'Cloud',
  siem: 'SIEM',
} as const;
export type Topic = keyof typeof TOPICS;

// Status shown as a chip on project cards and certifications.
export const STATUS = {
  planned: { label: 'Planned', chip: 'plan' },
  'in-progress': { label: 'In progress', chip: 'wip' },
  complete: { label: 'Complete', chip: 'done' },
} as const;

// EDIT HERE: the Credentials table. status: planned | in-progress | complete
export const CREDENTIALS: { name: string; domain: string; target: string; status: keyof typeof STATUS }[] = [
  { name: 'CompTIA Security+', domain: 'Foundations', target: '2026 Q4', status: 'in-progress' },
  { name: 'Microsoft AZ–900', domain: 'Azure fundamentals', target: '2027 Q1', status: 'planned' },
  { name: 'HTB CJCA', domain: 'Red + blue analyst', target: '2027 Q2', status: 'planned' },
  { name: 'Microsoft AZ–500', domain: 'Azure security engineer', target: '2027 Q3', status: 'planned' },
  { name: 'HTB CPTS', domain: 'Penetration testing', target: '2028 Q1', status: 'planned' },
  { name: 'CARTP', domain: 'Azure red team', target: '2028 Q3', status: 'planned' },
];
