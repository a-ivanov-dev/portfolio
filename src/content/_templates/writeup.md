---
code: ENG-0X
title: "{{title}}"
date: {{date:YYYY-MM-DDTHH:mm}}
status: in-progress
summary: Two or three sentences - what you did, on what, and what came out of it. Shown on the card and used as your LinkedIn post text.
topics:
  - Detection
tags:
  - Wazuh
type: Home lab
pinned: false
draft: true
---

<!-- HOW TO USE (this comment never shows on the site):
- Fields above: code = next free ENG-number, status = planned / in-progress / complete,
  topics = free text; each topic becomes a star label + topic page (reuse the same spelling, e.g. Detection).
- Optional fields you can add: scope (e.g. 3 hosts), cover (a picture, e.g. images/cover.png) + coverAlt.
- Paste screenshots anywhere below. Obsidian saves them in the "images" folder next to this note.
- Leave draft ticked while writing (visible only in the local preview). Untick to publish.
- Delete this comment when done. -->

## Executive summary

<p class="lede">One or two sentences: the most important result, in plain English.</p>

What you set out to do, where you started from, and how far it got.

## Scope & methodology

- **In scope:** systems, accounts, data sources
- **Starting point:** the access or data you began with
- **Out of scope:** what you deliberately left out

## Findings

<!-- Optional styled finding box. Severity: find--c/chip--crit, find--h/chip--high,
     find--m/chip--med, find--l/chip--low. Keep the blank lines inside the box. -->
<div class="find find--h">
<div class="find__head"><span class="find__id">F–01</span><h3 class="find__t">Finding title</h3><span class="chip chip--high">High</span></div>

What the issue is and why it matters.

<p class="find__lab">Reproduction</p>

```
command here
```

<p class="find__lab">Remediation</p>

- The fix.
- How to detect it next time.

</div>

## Conclusion

What the results mean and what you would do next.
