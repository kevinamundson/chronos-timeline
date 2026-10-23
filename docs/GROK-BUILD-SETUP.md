# Grok Build setup on the Mac Mini (one time)

Grok Build does the editing on Kevin's Mac Mini. Chronos (Grok Bot) reviews every change, and Kevin approves each merge. This page covers the one-time setup. The standing rules are in [`AGENTS.md`](../AGENTS.md).

## 1. Prerequisites

- **Node 20.** The repo pins `20` in `.node-version`, and Cloudflare Pages builds with `NODE_VERSION=20`. Install it with `nvm`, `fnm` or Homebrew (`brew install node@20`), then check with `node -v`.
- **git**, and the GitHub CLI: `brew install gh`.
- **Grok Build CLI,** signed in to Kevin's xAI account. Grok Build's usage is billed to that account, not to Cursor or Grok Bot credits.

## 2. Clone and install

```bash
mkdir -p ~/Code && cd ~/Code                     # or any path; tell Chronos which one
git clone https://github.com/kevinamundson/chronos-timeline.git
cd chronos-timeline
npm ci
npx playwright install chromium webkit           # npm run verify uses Chromium AND WebKit (site/verify-timelines.mjs)
npm run validate && npm run build && npm run verify
```

## 3. Git identity and GitHub auth

Kevin does this step himself. **Do not paste tokens into files, chats or commands.**

```bash
git config user.name  "Kevin R. Amundson"
git config user.email "28494144+kevinamundson@users.noreply.github.com"   # same no-reply address the repo already uses
gh auth login            # GitHub.com → HTTPS → "Login with a web browser"; stores the credential in the macOS keychain
gh auth setup-git        # lets git push over HTTPS using that credential
gh auth status
```

**Optional safety net:** in GitHub, go to Settings → Branches → add a rule for `main` that requires a pull request before merging. That blocks direct pushes to `main` from any machine. Kevin, as the owner, can still merge.

## 4. Grok Build project rules

- Grok Build loads `AGENTS.md` from the repo root automatically. This is verified in xAI's docs at https://docs.x.ai/build/features/project-rules.
  - It also reads `.grok/rules/*.md`, `AGENT.md` and `CLAUDE.md`.
  - It skips gitignored files.
  - Startup loading needs **folder trust**: run `grok --trust` once in this folder, or accept the trust prompt.
- To check what it loaded, run `grok inspect` in the repo. It should list `AGENTS.md`.
- **Start every session from an up-to-date main:**

  ```bash
  git switch main && git pull --ff-only
  git switch -c gb/<task-slug>
  ```

## 5. Source texts and private files

- Copyrighted PDFs live **outside the repo** and are never committed. They include Generations, Morecraft, the Roman Roads Herodotus etext, and the CFAH PDFs as downloaded. Chronos keeps its copies on its own box under `/workspace/*-src/`; the Mini does not need them.
- When Grok Build needs to read a **public-domain** text, it downloads the scan, PDF or OCR into `private-src/<source-id>/` in the repo. `private-src/` is gitignored, so these large files stay out of git. Record the exact download URL and edition in `data/sources.json`.
- Never put a Proton Drive or private Google Drive link into the repo or a PR.
- If a task needs one of Kevin's private copies, ask in the PR. Do not go looking for one.

## 6. Hand-off loop

```
Kevin assigns a task (docs/GROK-BUILD-TASKS.md)
  -> Grok Build: branch gb/<slug>, edit, validate + build + verify, commit, push, draft PR (template)
  -> Cloudflare Pages: preview build of the branch (https://gb-<slug>.chronos-bfi.pages.dev)
  -> Chronos: review per docs/REVIEW-CHECKLIST.md, report to Kevin
  -> Kevin: approve + merge (production deploy to chronos.kevinamundson.me)
  -> Chronos: npm run verify:live against production
```
