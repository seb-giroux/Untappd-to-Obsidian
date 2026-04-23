# Untappd → Obsidian Cellar — Chrome Extension

Save any Untappd beer page to your Obsidian beer cellar with one click.

## What it does

When you're on an Untappd beer page (`untappd.com/b/…`), click the extension icon to:
1. Automatically scrape the beer's name, brewery, style, ABV, IBU, rating and description
2. Fill in your own fields: bottled date, drink-by date, quantity, price, rating, tasting notes
3. Push the note directly into your Obsidian vault as a formatted Markdown file

---

## Installation (Chrome / Brave / Edge)

1. **Unzip** this folder somewhere permanent on your computer (don't delete it after install)
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **"Load unpacked"**
5. Select the `untappd-obsidian-ext` folder
6. The 🍺 icon will appear in your toolbar (pin it for easy access)

---

## Prerequisites

- **Obsidian must be running** on your computer when you click "Save to Obsidian"
- The extension uses the `obsidian://new` URI scheme to create notes — this only works when Obsidian is open

---

## Usage

1. Go to any Untappd beer page, e.g. `https://untappd.com/b/westvleteren-12/4382`
2. Click the 🍺 extension icon in your toolbar
3. The beer details are scraped automatically
4. Fill in your optional fields (bottled date, notes, rating…)
5. Set the **Obsidian folder** where you want the note saved (default: `Beer Cellar`)  
   This setting is remembered for next time.
6. Click **"Save to Obsidian ↗"** — Obsidian opens the new note instantly

---

## Obsidian folder setup (recommended)

Create a `Beer Cellar` folder in your vault. The extension saves notes there by default.

If you use a different folder, type it in the "Obsidian folder" field in the popup — it will be remembered.

---

## Note format

Each saved note includes:
- YAML frontmatter (compatible with Dataview plugin for querying your cellar)
- Beer info section
- Cellar details table
- Your rating and tasting notes
- Link back to the Untappd page

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Nothing happens when clicking "Save to Obsidian" | Make sure Obsidian is open and running |
| Extension shows "Navigate to an Untappd beer page" | You must be on a `untappd.com/b/…` URL |
| Some fields are blank | Untappd occasionally changes their HTML — the scraper may miss some fields; fill them in manually |
| Note opens but is empty | Try reloading the Untappd page, then clicking the extension again |

---

## Privacy

This extension only runs on `untappd.com` pages. It does not send any data to external servers. All processing happens locally in your browser.
