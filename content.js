// content.js — scrapes beer data from the Untappd beer page DOM

function scrapeBeerData() {
  const getText = (selector, root = document) => {
    const el = root.querySelector(selector);
    return el ? el.textContent.trim() : null;
  };

  const getAttr = (selector, attr, root = document) => {
    const el = root.querySelector(selector);
    return el ? el.getAttribute(attr) : null;
  };

  // Beer name — main heading on beer page
  const name =
    getText('.beer-details h1') ||
    getText('.name') ||
    getText('h1.title') ||
    document.title.replace(' | Untappd', '').trim();

  // Brewery name
  const brewery =
    getText('.beer-details .brewery a') ||
    getText('.brewery a') ||
    getText('p.brewery a') ||
    getText('.beer-details .brewery');

  // Style
  const style =
    getText('.beer-details .style') ||
    getText('.style') ||
    getText('p.style');

  // ABV — look for "X.X% ABV" pattern
  let abv = null;
  const abvEl =
    document.querySelector('.beer-details .abv') ||
    document.querySelector('.abv') ||
    document.querySelector('.details .abv');
  if (abvEl) {
    abv = abvEl.textContent.trim();
  } else {
    // Fallback: scan all text for ABV pattern
    const allText = document.body.innerText;
    const abvMatch = allText.match(/(\d+\.?\d*)\s*%\s*ABV/i);
    if (abvMatch) abv = abvMatch[1] + '%';
  }

  // IBU
  let ibu = null;
  const ibuEl =
    document.querySelector('.beer-details .ibu') ||
    document.querySelector('.ibu');
  if (ibuEl) {
    ibu = ibuEl.textContent.trim();
  } else {
    const allText = document.body.innerText;
    const ibuMatch = allText.match(/(\d+)\s*IBU/i);
    if (ibuMatch) ibu = ibuMatch[1];
  }

  // Rating
  const rating =
    getText('.beer-details .rating .num') ||
    getText('.caps[data-rating]') ||
    getAttr('.caps', 'data-rating') ||
    getText('.rating .num') ||
    null;

  // Description
  const description =
    getText('.beer-details .beer-description-read-less') ||
    getText('.beer-details .beer-description') ||
    getText('.desc') ||
    null;

  // Label / cover image
  const imageUrl =
    getAttr('.beer-details .label img', 'src') ||
    getAttr('.beer-details img.label', 'src') ||
    getAttr('img.label', 'src') ||
    getAttr('.beer-details .label-image img', 'src') ||
    null;

  // Brewery location
  const location =
    getText('.beer-details .brewery-info .location') ||
    getText('.location') ||
    null;

  return {
    name,
    brewery,
    style,
    abv,
    ibu,
    rating,
    description,
    imageUrl,
    location,
    untappdUrl: window.location.href,
    scrapedAt: new Date().toISOString()
  };
}

// Listen for message from popup asking for beer data
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBeerData') {
    sendResponse(scrapeBeerData());
  }
});
