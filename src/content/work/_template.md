---
# HOW TO USE: copy this file, rename it (the file name becomes the URL:
# ad-attacks.md -> aleksandrivanov.com/work/ad-attacks/), fill it in.
# Files starting with "_" are ignored, so this template never goes live.
code: ENG-04                  # next free number; also sets the order on the home page
title: Writeup title
date: 2026-11-01              # YYYY-MM-DD
status: complete              # planned | in-progress | complete
summary: >-                   # 2-3 sentences. Shown on the card AND your LinkedIn post draft.
  What you did, on what, and what came out of it.
topics: [detection]           # any of: active-directory, entra-id, network, detection, cloud, siem
tags: [Wazuh, Sysmon]         # tools shown as chips
type: Detection engineering   # optional, e.g. Home lab, Threat hunt
scope: 3 hosts                # optional
findings: { crit: 0, high: 1, med: 0, low: 0 }   # optional; delete the line if no findings
links:                        # optional extra buttons; delete if none
  - { label: Repository, href: "https://github.com/a-ivanov-dev/" }
draft: true                   # true = only visible locally. Set false to publish.
---

<!-- Everything below the --- line is the writeup page. If you leave it empty,
     the project only shows as a card on the home page (no "Read full writeup"). -->

## Executive summary

<p class="lede">One or two sentences: the single most important result, in plain English.</p>

What you set out to do, where you started from, and how far it got.

## Scope & methodology

What you tested or built, and the method you followed.

- **In scope:** systems, accounts, data sources
- **Starting point:** the access or data you began with
- **Out of scope:** what you deliberately left out

<!-- Images: put the file in public/images/ and reference it like this.
     The italic line right below an image is its caption. -->
![Short description of the screenshot](/images/example.png)
*Figure 1. What the reader should notice in this image.*

## Findings

<!-- One block per finding. Severity: find--c/chip--crit (Critical),
     find--h/chip--high (High), find--m/chip--med (Medium), find--l/chip--low (Low).
     Keep the blank lines inside the block, so the Markdown in it still works. -->
<div class="find find--h">
<div class="find__head"><span class="find__id">F–01</span><h3 class="find__t">Finding title: what is wrong, in one line</h3><span class="chip chip--high">High</span></div>

What the issue is, why it matters, and what an attacker could do with it.

<p class="find__lab">Reproduction</p>

```
# step 1 — what this command does
command here
```

<p class="find__lab">Remediation</p>

- The fix, specific enough that an admin could apply it.
- How to detect it if it happens again.

</div>

## Conclusion

What the results mean overall, what to fix first, and what you would do next.
