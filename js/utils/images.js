// Image search, verification, and caching utilities
window.ImageUtils = (() => {

  // --- Rate limiter for Gemini API (stay under 15 RPM free tier) ---
  const _rateQueue = [];
  let _lastCall = 0;
  const MIN_INTERVAL = 5500; // ~11 RPM max, leaves room for answer checking

  function _rateLimited(fn) {
    return new Promise((resolve) => {
      _rateQueue.push({ fn, resolve });
      _processQueue();
    });
  }

  function _processQueue() {
    if (_rateQueue.length === 0) return;
    const now = Date.now();
    const wait = Math.max(0, MIN_INTERVAL - (now - _lastCall));
    setTimeout(() => {
      const item = _rateQueue.shift();
      if (!item) return;
      _lastCall = Date.now();
      item.fn().then(item.resolve);
      if (_rateQueue.length > 0) _processQueue();
    }, wait);
  }

  // --- Convert image URL to base64 via canvas ---
  function imageToBase64(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Scale down to save tokens (max 400px on longest side)
        const max = 400;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > max || h > max) {
          const scale = max / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          const base64 = dataUrl.split(',')[1];
          resolve(base64);
        } catch {
          resolve(null); // Tainted canvas (CORS failure)
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // --- Verify image with Gemini Vision ---
  function verifyImageWithGemini(base64, word, apiKey) {
    return _rateLimited(async () => {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { inline_data: { mime_type: 'image/jpeg', data: base64 } },
                  { text: `Does this image clearly show or represent "${word}"? Consider that this is for a word-finding exercise — the image should help someone identify the word "${word}". Answer only YES or NO.` }
                ]
              }],
              generationConfig: { maxOutputTokens: 5, temperature: 0 }
            })
          }
        );
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
        return text?.startsWith('YES') || false;
      } catch (e) {
        console.warn('Image verification failed:', e);
        return null; // null = inconclusive, don't reject
      }
    });
  }

  // --- Search Wikimedia Commons directly (better than Wikipedia article thumbnails) ---
  async function searchWikimediaCommons(searchTerm, limit) {
    limit = limit || 5;
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`;
      const resp = await fetch(url);
      const data = await resp.json();
      const pages = data?.query?.pages;
      if (!pages) return [];
      return Object.values(pages)
        .filter(p => p.imageinfo && p.imageinfo[0])
        .map(p => p.imageinfo[0].thumburl || p.imageinfo[0].url)
        .filter(u => u && !u.endsWith('.svg')); // Skip SVGs (often diagrams)
    } catch {
      return [];
    }
  }

  // --- Search Wikipedia article thumbnail (existing approach, as fallback) ---
  async function searchWikipediaImage(searchTerm, lang) {
    async function tryWiki(wikiLang) {
      try {
        const url = `https://${wikiLang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*&gsrlimit=3`;
        const resp = await fetch(url);
        const data = await resp.json();
        const pages = data?.query?.pages;
        if (!pages) return [];
        return Object.values(pages)
          .map(p => p?.thumbnail?.source)
          .filter(Boolean);
      } catch {
        return [];
      }
    }
    const results = await tryWiki('en');
    if (lang === 'nl') {
      const nlResults = await tryWiki('nl');
      return [...results, ...nlResults];
    }
    return results;
  }

  // --- Main pipeline: get a verified image for a word ---
  async function getVerifiedImageForWord(word, imageSearch, lang, apiKey) {
    // 1. Check cache
    const cached = AppStorage.getVerifiedImage(word);
    if (cached) {
      console.log(`[img] Cache hit for "${word}"`);
      return cached;
    }

    // 2. Check curated IMAGE_MAP (trusted, no verification needed)
    const map = window.IMAGE_MAP || {};
    const mapUrl = map[word] || map[word.toLowerCase()];
    if (mapUrl) {
      console.log(`[img] IMAGE_MAP hit for "${word}"`);
      AppStorage.saveVerifiedImage(word, mapUrl);
      return mapUrl;
    }

    // 3. Gather candidates from multiple sources
    const searchKey = imageSearch || word;
    console.log(`[img] Searching for "${word}" (search: "${searchKey}")`);

    const [commonsResults, wikiResults] = await Promise.all([
      searchWikimediaCommons(searchKey, 5),
      searchWikipediaImage(searchKey, lang),
    ]);

    // Deduplicate
    const seen = new Set();
    const candidates = [];
    for (const url of [...commonsResults, ...wikiResults]) {
      if (!seen.has(url)) {
        seen.add(url);
        candidates.push(url);
      }
    }

    console.log(`[img] Found ${candidates.length} candidates for "${word}"`);

    if (candidates.length === 0) {
      return null; // Will fall back to emoji in the component
    }

    // 4. If no API key, return first candidate (same as old behavior)
    if (!apiKey) {
      console.log(`[img] No API key, using first candidate for "${word}"`);
      return candidates[0];
    }

    // 5. Verify candidates with Gemini Vision
    for (const url of candidates) {
      const base64 = await imageToBase64(url);
      if (!base64) continue; // CORS or load failure

      const result = await verifyImageWithGemini(base64, word, apiKey);
      if (result === true) {
        console.log(`[img] Verified "${word}" ✓`);
        AppStorage.saveVerifiedImage(word, url);
        return url;
      } else if (result === null) {
        // API error / inconclusive — use this image rather than reject
        console.log(`[img] Verification inconclusive for "${word}", using image`);
        AppStorage.saveVerifiedImage(word, url);
        return url;
      }
      console.log(`[img] Rejected candidate for "${word}" ✗`);
    }

    // 6. All candidates rejected — return null (emoji fallback)
    console.log(`[img] No verified image found for "${word}"`);
    return null;
  }

  return {
    getVerifiedImageForWord,
    searchWikimediaCommons,
    searchWikipediaImage,
    imageToBase64,
    verifyImageWithGemini,
  };
})();
