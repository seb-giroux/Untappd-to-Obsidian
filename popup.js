// popup.js — main popup logic

const app = document.getElementById('app');
let beerData = null;
let myRating = 0;

// ── Helpers ──────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

function safeFilename(name) {
  return (name || 'beer')
    .replace(/[\\/:*?"<>|#^[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function clean(val) {
  if (!val) return '';
  // Remove % ABV suffix noise, trim
  return val.replace(/\s+/g, ' ').trim();
}

function buildMarkdown(beer, extra) {
  const stars = '★'.repeat(extra.myRating) + '☆'.repeat(5 - extra.myRating);
  const ratingVal = extra.myRating || '';

  return `---
tags:
  - beer
  - cellar
beer: "${clean(beer.name)}"
brewery: "${clean(beer.brewery)}"
style: "${clean(beer.style)}"
abv: "${clean(beer.abv)}"
ibu: "${clean(beer.ibu)}"
untappd_rating: "${parseFloat(clean(beer.rating)).toFixed(2)}"
untappd_url: "${beer.untappdUrl}"
bottled_date: "${extra.bottledDate}"
drink_by: "${extra.drinkBy}"
quantity: ${extra.quantity || 1}
price: "${extra.price}"
my_rating: ${ratingVal}
added: "${today()}"
---

# ${clean(beer.name) || 'Unknown Beer'}

**Brewery:** ${clean(beer.brewery) || '—'}
**Style:** ${clean(beer.style) || '—'}
**ABV:** ${clean(beer.abv) || '—'} | **IBU:** ${clean(beer.ibu) || '—'}
**Untappd rating:** ${clean(beer.rating) || '—'}/5

## Description

${clean(beer.description) || '—'}

---

## Cellar details

| Field | Value |
|---|---|
| Bottled | ${extra.bottledDate || '—'} |
| Drink by / best before | ${extra.drinkBy || '—'} |
| Quantity | ${extra.quantity || 1} bottle(s) |
| Purchase price | ${extra.price || '—'} |
| Added | ${today()} |

---

## My notes

**Rating:** ${stars} (${ratingVal || '—'}/5)

${extra.notes || '*(no tasting notes yet)*'}

---

## Links

- [View on Untappd](${beer.untappdUrl})
`;
}

// ── Render states ─────────────────────────────────────────────────────────────

function renderNotOnPage() {
  app.innerHTML = `
    <div class="state-error">
      <div class="emoji">🔍</div>
      <p>Navigate to an <strong>Untappd beer page</strong> first.<br/>
         e.g. <a href="https://untappd.com/b/brewery-name/12345" target="_blank">untappd.com/b/…</a>
      </p>
    </div>
  `;
}

function renderSuccess(noteName) {
  app.innerHTML = `
    <div class="state-success">
      <div class="emoji">✅</div>
      <h3>Saved to Obsidian!</h3>
      <p>Note "<strong>${noteName}</strong>" was opened in Obsidian.<br/>
         If nothing happened, make sure Obsidian is running.</p>
    </div>
  `;
}

function renderBeer(beer) {
  // Load saved settings
  chrome.storage.sync.get(['vaultFolder'], (prefs) => {
    const folder = prefs.vaultFolder || 'Beer Cellar';

    const imgHtml = beer.imageUrl
      ? `<img class="beer-img" src="${beer.imageUrl}" alt="label" />`
      : `<div class="beer-img-placeholder">🍺</div>`;

    const abvBadge = beer.abv ? `<span class="badge abv">${clean(beer.abv)}</span>` : '';
    const ratingBadge = beer.rating ? `<span class="badge rating">★ ${clean(beer.rating)}</span>` : '';
    const styleBadge = beer.style ? `<span class="badge">${clean(beer.style)}</span>` : '';

    app.innerHTML = `
      <div class="beer-card">
        ${imgHtml}
        <div class="beer-info">
          <div class="beer-name">${clean(beer.name) || 'Unknown Beer'}</div>
          <div class="beer-brewery">${clean(beer.brewery) || ''}</div>
          <div class="beer-badges">
            ${styleBadge}
            ${abvBadge}
            ${ratingBadge}
          </div>
        </div>
      </div>

      <div class="form">
        <div class="field-row">
          <div class="field">
            <label>Bottled date</label>
            <input type="date" id="bottledDate" />
          </div>
          <div class="field">
            <label>Drink by</label>
            <input type="date" id="drinkBy" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Quantity</label>
            <input type="number" id="quantity" value="1" min="1" max="999" />
          </div>
          <div class="field">
            <label>Price</label>
            <input type="text" id="price" placeholder="e.g. $12.50" />
          </div>
        </div>

        <div class="field">
          <label>My rating</label>
          <div class="stars" id="stars">
            <span class="star" data-v="1">★</span>
            <span class="star" data-v="2">★</span>
            <span class="star" data-v="3">★</span>
            <span class="star" data-v="4">★</span>
            <span class="star" data-v="5">★</span>
          </div>
        </div>

        <div class="field">
          <label>Tasting notes</label>
          <textarea id="notes" placeholder="Aromas, flavours, finish…"></textarea>
        </div>
      </div>

      <div class="divider"></div>

      <div class="vault-setting">
        <label>Obsidian folder</label>
        <input type="text" id="vaultFolder" value="${folder}" placeholder="Beer Cellar" />
      </div>

      <div class="actions">
        <button class="btn" id="previewBtn">Preview note</button>
        <button class="btn primary" id="saveBtn">Save to Obsidian ↗</button>
      </div>
    `;

    // Star rating interaction
    document.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', () => {
        myRating = parseInt(star.dataset.v);
        updateStars();
      });
      star.addEventListener('mouseover', () => {
        const v = parseInt(star.dataset.v);
        document.querySelectorAll('.star').forEach(s => {
          s.classList.toggle('on', parseInt(s.dataset.v) <= v);
        });
      });
      star.addEventListener('mouseout', updateStars);
    });

    function updateStars() {
      document.querySelectorAll('.star').forEach(s => {
        s.classList.toggle('on', parseInt(s.dataset.v) <= myRating);
      });
    }

    // Save folder preference on change
    document.getElementById('vaultFolder').addEventListener('change', (e) => {
      chrome.storage.sync.set({ vaultFolder: e.target.value.trim() });
    });

    // Save to Obsidian button
    document.getElementById('saveBtn').addEventListener('click', () => {
      const extra = getFormValues();
      const folder = document.getElementById('vaultFolder').value.trim() || 'Beer Cellar';
      const noteName = safeFilename(beer.name || 'Unknown Beer');
      const content = buildMarkdown(beer, extra);

      // Save folder pref
      chrome.storage.sync.set({ vaultFolder: folder });

      // Build obsidian:// URI
      // "new" action creates/opens a note, "content" sets the body
      const obsidianPath = folder ? `${folder}/${noteName}` : noteName;
      const uri = `obsidian://new?` +
        `file=${encodeURIComponent(obsidianPath)}` +
        `&content=${encodeURIComponent(content)}` +
        `&silent=false`;

      chrome.tabs.create({ url: uri, active: false }, () => {
        // Close the tab immediately — it's just used to trigger the protocol
        chrome.tabs.query({ url: 'obsidian://*' }, (tabs) => {
          tabs.forEach(t => chrome.tabs.remove(t.id));
        });
      });

      renderSuccess(noteName);
    });

    // Preview button — opens markdown in a new tab as plain text
    document.getElementById('previewBtn').addEventListener('click', () => {
      const extra = getFormValues();
      const content = buildMarkdown(beer, extra);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      chrome.tabs.create({ url });
    });
  });
}

function getFormValues() {
  return {
    bottledDate: document.getElementById('bottledDate')?.value || '',
    drinkBy: document.getElementById('drinkBy')?.value || '',
    quantity: document.getElementById('quantity')?.value || '1',
    price: document.getElementById('price')?.value || '',
    notes: document.getElementById('notes')?.value || '',
    myRating
  };
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes('untappd.com/b/')) {
      renderNotOnPage();
      return;
    }

    // Ask content script to scrape the page
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getBeerData' });

    if (!response || !response.name) {
      // Content script may not be injected yet — try injecting manually
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      const retry = await chrome.tabs.sendMessage(tab.id, { action: 'getBeerData' });
      if (!retry || !retry.name) {
        renderNotOnPage();
        return;
      }
      beerData = retry;
    } else {
      beerData = response;
    }

    renderBeer(beerData);

  } catch (err) {
    renderNotOnPage();
  }
}

init();
