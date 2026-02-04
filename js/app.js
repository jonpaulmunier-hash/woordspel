const { useState, useEffect, useCallback, useRef, useMemo } = React;

// ============================================================
// HELPERS
// ============================================================

const TEXTS = {
  nl: {
    appTitle: 'Woordspel',
    greeting: 'Hallo!',
    greetingSub: 'Wat wil je oefenen?',
    pictureNaming: 'Plaatje Benoemen',
    pictureNamingDesc: 'Bekijk het plaatje en zeg het woord',
    sentenceFill: 'Zin Aanvullen',
    sentenceFillDesc: 'Maak de zin af met het juiste woord',
    wordRepeat: 'Woord Herhalen',
    wordRepeatDesc: 'Luister en herhaal het woord',
    dashboard: 'Voortgang',
    settings: 'Instellingen',
    home: 'Oefenen',
    hint: 'Hint',
    speak: 'Spreek',
    type: 'Of typ hier...',
    check: 'Controleer',
    next: 'Volgende',
    finish: 'Klaar!',
    correct: 'Goed zo!',
    incorrect: 'Probeer nog eens',
    theAnswerWas: 'Het antwoord was:',
    streak: 'Op rij!',
    round: 'Ronde',
    score: 'Score',
    totalExercises: 'Totaal',
    totalCorrect: 'Goed',
    accuracy: 'Nauwkeurigheid',
    bestStreak: 'Beste reeks',
    currentStreak: 'Huidige reeks',
    history: 'Geschiedenis',
    noHistory: 'Nog geen oefeningen gedaan',
    export: 'Rapport delen',
    download: 'Rapport downloaden',
    language: 'Taal',
    difficulty: 'Moeilijkheid',
    easy: 'Makkelijk',
    medium: 'Gemiddeld',
    hard: 'Moeilijk',
    autoAdjust: 'Auto-aanpassen',
    on: 'Aan',
    off: 'Uit',
    sound: 'Geluid',
    clearData: 'Wis alle gegevens',
    clearConfirm: 'Weet je het zeker? Alle voortgang wordt gewist.',
    listenWord: 'Luister naar het woord',
    repeatWord: 'Herhaal het woord',
    tapToListen: 'Tik om te luisteren',
    tapToSpeak: 'Tik om te spreken',
    whatIsThis: 'Wat is dit?',
    fillBlank: 'Vul het ontbrekende woord in',
    wellDone: 'Goed gedaan!',
    keepGoing: 'Ga zo door!',
    amazing: 'Fantastisch!',
    tryHarder: 'Volgende keer beter!',
    greatJob: 'Geweldig!',
    encouragements: ['Goed zo!', 'Super!', 'Geweldig!', 'Fantastisch!', 'Heel goed!', 'Knap!', 'Prima!', 'Top!'],
    levelUp: 'Niveau omhoog!',
    levelDown: 'Iets makkelijker nu',
    difficultyAdjusted: 'Moeilijkheid aangepast',
    checking: 'Even denken...',
    loading: 'Woorden verzamelen...',
    loadingImages: 'Plaatjes zoeken...',
    aiApiKey: 'AI Sleutel (Gemini)',
    aiApiKeyPlaceholder: 'Plak je Gemini API key hier',
    aiApiKeyHelp: 'Gratis op aistudio.google.com',
    aiEnabled: 'Slim antwoorden checken',
  },
  en: {
    appTitle: 'Woordspel',
    greeting: 'Hello!',
    greetingSub: 'What would you like to practice?',
    pictureNaming: 'Picture Naming',
    pictureNamingDesc: 'Look at the picture and say the word',
    sentenceFill: 'Fill the Sentence',
    sentenceFillDesc: 'Complete the sentence with the right word',
    wordRepeat: 'Word Repeat',
    wordRepeatDesc: 'Listen and repeat the word',
    dashboard: 'Progress',
    settings: 'Settings',
    home: 'Practice',
    hint: 'Hint',
    speak: 'Speak',
    type: 'Or type here...',
    check: 'Check',
    next: 'Next',
    finish: 'Done!',
    correct: 'Correct!',
    incorrect: 'Try again',
    theAnswerWas: 'The answer was:',
    streak: 'In a row!',
    round: 'Round',
    score: 'Score',
    totalExercises: 'Total',
    totalCorrect: 'Correct',
    accuracy: 'Accuracy',
    bestStreak: 'Best streak',
    currentStreak: 'Current streak',
    history: 'History',
    noHistory: 'No exercises yet',
    export: 'Share report',
    download: 'Download report',
    language: 'Language',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    autoAdjust: 'Auto-adjust',
    on: 'On',
    off: 'Off',
    sound: 'Sound',
    clearData: 'Clear all data',
    clearConfirm: 'Are you sure? All progress will be lost.',
    listenWord: 'Listen to the word',
    repeatWord: 'Repeat the word',
    tapToListen: 'Tap to listen',
    tapToSpeak: 'Tap to speak',
    whatIsThis: 'What is this?',
    fillBlank: 'Fill in the missing word',
    wellDone: 'Well done!',
    keepGoing: 'Keep it up!',
    amazing: 'Amazing!',
    tryHarder: 'Better luck next time!',
    greatJob: 'Great job!',
    encouragements: ['Great!', 'Super!', 'Awesome!', 'Amazing!', 'Well done!', 'Excellent!', 'Perfect!', 'Wonderful!'],
    levelUp: 'Level up!',
    levelDown: 'Taking it easier now',
    difficultyAdjusted: 'Difficulty adjusted',
    checking: 'Thinking...',
    loading: 'Gathering words...',
    loadingImages: 'Finding images...',
    aiApiKey: 'AI Key (Gemini)',
    aiApiKeyPlaceholder: 'Paste your Gemini API key here',
    aiApiKeyHelp: 'Free at aistudio.google.com',
    aiEnabled: 'Smart answer checking',
  },
};

function getWordData(lang) {
  return lang === 'nl' ? window.WORDS_NL : window.WORDS_EN;
}

function getWordsForDifficulty(category, difficulty) {
  const words = category.words;
  switch (difficulty) {
    case 'easy': return [...words.easy];
    case 'medium': return [...words.easy, ...words.medium];
    case 'hard': return [...words.easy, ...words.medium, ...words.hard];
    default: return [...words.easy];
  }
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fuzzyMatch(input, target) {
  const a = input.toLowerCase().trim();
  const b = target.toLowerCase().trim();
  if (a === b) return true;
  // Allow 1 character difference for words > 3 chars
  if (b.length > 3) {
    let diff = 0;
    const maxLen = Math.max(a.length, b.length);
    if (Math.abs(a.length - b.length) > 1) return false;
    for (let i = 0; i < maxLen; i++) {
      if (a[i] !== b[i]) diff++;
      if (diff > 1) return false;
    }
    return true;
  }
  return false;
}

// Smart word matching: accepts plural, diminutive, article prefixes, verb forms
function wordFormsMatch(input, target) {
  const a = input.toLowerCase().trim();
  const b = target.toLowerCase().trim();
  if (fuzzyMatch(a, b)) return true;

  // Strip articles (de/het/een / the/a/an)
  const stripArticle = s => s.replace(/^(de|het|een|the|a|an)\s+/, '');
  if (fuzzyMatch(stripArticle(a), stripArticle(b))) return true;

  // Check if one is a common form of the other
  const forms = w => {
    const f = [w];
    // Dutch plurals
    f.push(w + 'en', w + 's', w + "'s", w + 'n');
    // Double consonant plurals (kat->katten, bed->bedden)
    if (w.length >= 2) f.push(w + w[w.length - 1] + 'en');
    // Diminutives
    f.push(w + 'je', w + 'tje', w + 'pje', w + 'etje');
    // Strip plural/diminutive to get stem
    if (w.endsWith('en') && w.length > 3) f.push(w.slice(0, -2));
    if (w.endsWith('s') && w.length > 2) f.push(w.slice(0, -1));
    if (w.endsWith("'s") && w.length > 3) f.push(w.slice(0, -2));
    if (w.endsWith('n') && w.length > 2) f.push(w.slice(0, -1));
    if (w.endsWith('je') && w.length > 3) f.push(w.slice(0, -2));
    if (w.endsWith('tje') && w.length > 4) f.push(w.slice(0, -3));
    if (w.endsWith('jes') && w.length > 4) f.push(w.slice(0, -3));
    // Double consonant stem (katten->kat, bedden->bed)
    if (w.endsWith('en') && w.length > 4 && w[w.length - 3] === w[w.length - 4]) {
      f.push(w.slice(0, -3));
    }
    // English plurals
    if (w.endsWith('es') && w.length > 3) f.push(w.slice(0, -2));
    if (w.endsWith('ies') && w.length > 4) f.push(w.slice(0, -3) + 'y');
    // English -ing / -ed
    if (w.endsWith('ing') && w.length > 4) f.push(w.slice(0, -3), w.slice(0, -3) + 'e');
    if (w.endsWith('ed') && w.length > 3) f.push(w.slice(0, -2), w.slice(0, -1));
    return f;
  };

  const aForms = forms(a);
  const bForms = forms(b);
  // Check if any form of input matches any form of target
  for (const af of aForms) {
    for (const bf of bForms) {
      if (af === bf) return true;
      if (af.length > 3 && bf.length > 3 && fuzzyMatch(af, bf)) return true;
    }
  }
  return false;
}

// AI-based answer checking using Gemini API (free tier)
async function checkAnswerWithAI(answer, target, alts, lang, exerciseType) {
  const settings = AppStorage.getSettings();
  const apiKey = settings.aiApiKey;
  if (!apiKey) return null;

  const langName = lang === 'nl' ? 'Dutch' : 'English';
  const allWords = [target, ...(alts || [])].join(', ');
  let context = '';
  if (exerciseType === 'picture') {
    context = `This is a picture naming exercise. The patient sees an image/emoji representing "${target}" and must name what they see.`;
  } else if (exerciseType === 'sentence') {
    context = `This is a fill-in-the-blank sentence exercise. The expected answer is "${target}".`;
  } else {
    context = `This is a word repetition exercise. The target word is "${target}".`;
  }

  const prompt = `You are checking answers in a ${langName} word-finding exercise for aphasia therapy.
${context}
Target word: "${target}"
Also accepted: ${allWords}
Patient answered: "${answer}"

Is this a reasonable and correct answer? Consider synonyms, visual descriptions of the same thing, informal versions, plural/singular/diminutive forms, and related words that describe the same concept.
Answer ONLY "YES" or "NO".`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 5, temperature: 0 }
        })
      }
    );
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
    return text?.startsWith('YES') || false;
  } catch (e) {
    console.warn('AI check failed:', e);
    return null;
  }
}

// Search Wikipedia for an image matching a search term
async function searchWikipediaImage(searchTerm) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*&gsrlimit=1`;
    const resp = await fetch(url);
    const data = await resp.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    const firstPage = Object.values(pages)[0];
    return firstPage?.thumbnail?.source || null;
  } catch (e) {
    return null;
  }
}

// Generate random words using Gemini AI
async function generateAIWords(lang, difficulty, count, exclude) {
  const settings = AppStorage.getSettings();
  const apiKey = settings.aiApiKey;
  if (!apiKey) return null;

  const langName = lang === 'nl' ? 'Dutch' : 'English';
  const excludeList = exclude && exclude.length > 0
    ? `\nDo NOT use any of these words: ${exclude.join(', ')}`
    : '';
  const diffDesc = difficulty === 'easy'
    ? 'very common everyday words (simple nouns: animals, food, household objects, body parts, clothing, vehicles, nature)'
    : difficulty === 'medium'
    ? 'moderately common words (nouns and some verbs: kitchen items, sports, professions, weather, furniture, musical instruments)'
    : 'less common but recognizable words (compound nouns, specific objects, abstract-but-visual concepts)';

  const prompt = `Generate ${count} random ${langName} words for a picture-naming word-finding exercise for aphasia therapy.
Difficulty: ${difficulty} - ${diffDesc}
Each word MUST be something that can be clearly shown in a single photograph.${excludeList}

Return ONLY a JSON array, no markdown, no explanation:
[{"word":"hond","article":"de","category":"Dieren","emoji":"🐕","imageSearch":"dog"}]

Rules:
- "word" is the ${langName} word
- "article" is "de", "het", or "" (for verbs/adjectives)
- "category" is a ${langName} category name
- "emoji" is one relevant emoji
- "imageSearch" is a simple English word/phrase for finding a photo on Wikipedia
- Mix different categories
- Only concrete, photographable things`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 1.0 }
        })
      }
    );
    const data = await resp.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return null;
    // Strip markdown code fences if present
    text = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
    const words = JSON.parse(text);
    if (!Array.isArray(words) || words.length === 0) return null;
    return words;
  } catch (e) {
    console.warn('AI word generation failed:', e);
    return null;
  }
}

// Generate random sentences using Gemini AI
async function generateAISentences(lang, difficulty, count, exclude) {
  const settings = AppStorage.getSettings();
  const apiKey = settings.aiApiKey;
  if (!apiKey) return null;

  const langName = lang === 'nl' ? 'Dutch' : 'English';
  const excludeList = exclude && exclude.length > 0
    ? `\nDo NOT use these answers: ${exclude.join(', ')}`
    : '';

  const prompt = `Generate ${count} random ${langName} fill-in-the-blank sentences for aphasia therapy.
Difficulty: ${difficulty}${excludeList}

Return ONLY a JSON array, no markdown:
[{"sentence":"De hond ___","answer":"blaft","hint":"Wat doet een hond?","alts":["blafte","bijt"]}]

Rules:
- "sentence" has exactly one ___ blank
- "answer" is the primary expected word
- "hint" is a helpful clue
- "alts" are other acceptable answers (2-5 alternatives)
- Mix topics: daily life, nature, food, family, work, hobbies
- Keep sentences simple and clear for aphasia patients`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 1.0 }
        })
      }
    );
    const data = await resp.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return null;
    text = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
    const sentences = JSON.parse(text);
    if (!Array.isArray(sentences) || sentences.length === 0) return null;
    return sentences;
  } catch (e) {
    console.warn('AI sentence generation failed:', e);
    return null;
  }
}

function getProgressiveHints(word, hintLevel) {
  switch (hintLevel) {
    case 0: return null; // No hint yet
    case 1: return word[0] + '...'; // First letter
    case 2: return word.slice(0, Math.ceil(word.length / 2)) + '...'; // First half
    case 3: return 'listen'; // TTS (handled by component)
    case 4: return word; // Full answer
    default: return word;
  }
}

// ============================================================
// SPEECH RECOGNITION HOOK
// ============================================================

function useSpeechRecognition(lang) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'nl' ? 'nl-NL' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      // Collect ALL alternatives from speech recognition
      const results = [];
      for (let i = 0; i < event.results[0].length; i++) {
        results.push(event.results[0][i].transcript.toLowerCase().trim());
      }
      setTranscript(results[0]);
      setAlternatives(results);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setAlternatives([]);
  }, []);

  return { isListening, transcript, alternatives, isSupported, startListening, stopListening, resetTranscript };
}

// ============================================================
// TEXT TO SPEECH
// ============================================================

// Cache loaded voices globally
let _cachedVoices = [];
function _loadVoices() {
  _cachedVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}
if (window.speechSynthesis) {
  _loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = _loadVoices;
  }
}

function _findVoice(langCode) {
  const voices = _cachedVoices.length > 0 ? _cachedVoices : (window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
  // Try exact match (e.g. 'nl-NL')
  let v = voices.find(v => v.lang === langCode);
  if (v) return v;
  // Try prefix match (e.g. 'nl')
  const prefix = langCode.split('-')[0];
  v = voices.find(v => v.lang.startsWith(prefix));
  return v || null;
}

function speakWord(word, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  const langCode = lang === 'nl' ? 'nl-NL' : 'en-US';
  utterance.lang = langCode;

  const voice = _findVoice(langCode);
  if (voice) utterance.voice = voice;

  utterance.rate = 0.8;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

// ============================================================
// COMPONENTS
// ============================================================

// --- MIC BUTTON ---
function MicButton({ lang, onResult, disabled }) {
  const { isListening, transcript, alternatives, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition(lang);
  const settings = AppStorage.getSettings();
  const t = TEXTS[settings.language] || TEXTS.nl;

  useEffect(() => {
    if (transcript && !isListening) {
      onResult(transcript, alternatives);
      resetTranscript();
    }
  }, [transcript, isListening]);

  if (!isSupported) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <button
        className={`mic-btn ${isListening ? 'listening' : ''}`}
        onClick={() => {
          if (settings.soundEnabled) SoundFX.playClick();
          if (isListening) {
            stopListening();
          } else {
            startListening();
          }
        }}
        disabled={disabled}
      >
        <span className="mic-icon">{isListening ? '🔴' : '🎤'}</span>
      </button>
      <span className="mic-label">{isListening ? '...' : t.tapToSpeak}</span>
    </div>
  );
}

// --- HINT BAR ---
function HintBar({ word, lang, hintLevel, onRequestHint, maxHints }) {
  const settings = AppStorage.getSettings();
  const t = TEXTS[settings.language] || TEXTS.nl;
  const hint = getProgressiveHints(word, hintLevel);

  return (
    <div className="hint-bar">
      {hintLevel < maxHints && (
        <button className="hint-btn" onClick={() => {
          if (settings.soundEnabled) SoundFX.playHint();
          onRequestHint();
        }}>
          💡 {t.hint} ({hintLevel}/{maxHints})
        </button>
      )}
      {hint && hint !== 'listen' && hint !== word && (
        <div className="hint-text">💡 {hint}</div>
      )}
      {hint === 'listen' && (
        <button className="hint-btn" onClick={() => speakWord(word, lang)} style={{ borderColor: '#4CAF50', color: '#4CAF50' }}>
          🔊 {t.listenWord}
        </button>
      )}
      {hint === word && (
        <div className="hint-text">✨ {word}</div>
      )}
    </div>
  );
}

// --- IMAGE DISPLAY ---
function ImageDisplay({ word, lang, imageUrl: dynamicUrl }) {
  const [wikiUrl, setWikiUrl] = useState(null);
  const [wikiFetched, setWikiFetched] = useState(false);
  const [wikiError, setWikiError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset states when word or URL changes
  useEffect(() => {
    setWikiUrl(null);
    setWikiFetched(false);
    setWikiError(false);
  }, [word, dynamicUrl]);

  // Always fetch from Wikipedia if no dynamicUrl provided
  useEffect(() => {
    if (dynamicUrl) return;
    if (wikiFetched) return;
    let cancelled = false;
    setLoading(true);
    searchWikipediaImage(word).then((url) => {
      if (!cancelled) {
        setWikiUrl(url);
        setWikiFetched(true);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [word, dynamicUrl, wikiFetched]);

  const finalUrl = dynamicUrl || wikiUrl;

  if (loading && !finalUrl) {
    return (
      <div className="prompt-image-container">
        <div style={{ width: '200px', height: '200px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="listening-pulse" style={{ width: '40px', height: '40px', background: 'var(--primary)' }}></div>
        </div>
      </div>
    );
  }

  if (!finalUrl || wikiError) {
    return (
      <div className="prompt-image-container">
        <div style={{ width: '200px', height: '200px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>{word}</div>
      </div>
    );
  }

  return (
    <div className="prompt-image-container">
      <img
        className="prompt-image"
        src={finalUrl}
        alt=""
        onError={() => setWikiError(true)}
      />
    </div>
  );
}

// --- PICTURE NAMING EXERCISE ---
function PictureNaming({ settings, onFinish }) {
  const t = TEXTS[settings.language] || TEXTS.nl;
  const data = getWordData(settings.language);
  const categories = Object.values(data.categories);
  const ROUND_SIZE = 8;

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [roundKey, setRoundKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  // Load words: AI-generated or local fallback
  useEffect(() => {
    let cancelled = false;
    async function loadWords() {
      setLoading(true);
      setLoadingMsg(t.loading);
      setCurrentIndex(0);
      setResults([]);
      setFeedback(null);
      setInput('');
      setHintLevel(0);

      const mastered = AppStorage.getMasteredWords();

      // Try AI generation when API key is set
      if (settings.aiApiKey) {
        const aiWords = await generateAIWords(settings.language, settings.difficulty, ROUND_SIZE, mastered);
        if (!cancelled && aiWords && aiWords.length > 0) {
          setLoadingMsg(t.loadingImages);
          // Fetch Wikipedia images in parallel
          const withImages = await Promise.all(aiWords.map(async (w) => {
            const imgUrl = await searchWikipediaImage(w.imageSearch);
            return { ...w, imageUrl: imgUrl };
          }));
          if (!cancelled) {
            setWords(withImages);
            setLoading(false);
            return;
          }
        }
      }

      // Fallback: local words, filtering out mastered
      if (!cancelled) {
        const allWords = categories.flatMap(cat =>
          getWordsForDifficulty(cat, settings.difficulty).map(w => ({ ...w, category: cat.name }))
        );
        const available = allWords.filter(w => !mastered.includes(w.word.toLowerCase()));
        const pool = available.length >= ROUND_SIZE ? available : allWords;
        setWords(shuffleArray(pool).slice(0, ROUND_SIZE));
        setLoading(false);
      }
    }
    loadWords();
    return () => { cancelled = true; };
  }, [roundKey]);

  const currentWord = words[currentIndex];
  const isRoundComplete = !loading && words.length > 0 && currentIndex >= words.length;

  const checkAnswer = useCallback(async (answer, speechAlts) => {
    if (!answer || feedback || !currentWord) return;
    const allValid = [currentWord.word, ...(currentWord.alts || [])];
    // Try primary answer and all speech recognition alternatives
    const allAttempts = [answer, ...(speechAlts || [])];
    let isCorrect = allAttempts.some(attempt =>
      allValid.some(valid => wordFormsMatch(attempt, valid))
    );

    // If local match fails, try AI check (send best transcript)
    if (!isCorrect && settings.aiApiKey) {
      setFeedback('checking');
      const aiResult = await checkAnswerWithAI(answer, currentWord.word, currentWord.alts || [], settings.language, 'picture');
      if (aiResult === true) isCorrect = true;
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setResults(prev => [...prev, isCorrect]);

    // Mark correctly answered words as mastered
    if (isCorrect) {
      AppStorage.addMasteredWord(currentWord.word);
    }

    const stats = AppStorage.recordAnswer(isCorrect);

    if (settings.soundEnabled) {
      if (isCorrect) {
        SoundFX.playCorrect();
        if (stats.currentStreak > 0 && stats.currentStreak % 5 === 0) {
          SoundFX.playStreak();
        }
        ConfettiFX.launch();
      } else {
        SoundFX.playIncorrect();
      }
    }
  }, [currentWord, feedback, settings]);

  const handleNext = () => {
    setFeedback(null);
    setInput('');
    setHintLevel(0);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSpeechResult = (transcript, alternatives) => {
    setInput(transcript);
    checkAnswer(transcript, alternatives);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="exercise" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ fontSize: '2.5rem', marginBottom: '16px', animation: 'spin 1.5s linear infinite' }}>🔄</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{loadingMsg}</div>
        </div>
      </div>
    );
  }

  if (isRoundComplete) {
    const score = results.filter(Boolean).length;
    AppStorage.saveSession({
      exerciseType: 'pictureNaming',
      score,
      total: words.length,
      difficulty: settings.difficulty,
      language: settings.language,
    });
    return <ResultScreen score={score} total={words.length} onHome={() => onFinish()} onRetry={() => {
      setRoundKey(k => k + 1);
    }} settings={settings} />;
  }

  if (!currentWord) return null;

  return (
    <div className="exercise">
      <div className="exercise-top">
        <button className="back-btn" onClick={() => onFinish()}>←</button>
        <div className="progress-dots">
          {words.map((_, i) => (
            <div key={i} className={`progress-dot ${i < currentIndex ? (results[i] ? 'done' : 'wrong') : i === currentIndex ? 'current' : ''}`} />
          ))}
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentIndex + 1}/{words.length}</span>
      </div>

      <div className="exercise-prompt">
        <ImageDisplay word={currentWord.word} lang={settings.language} imageUrl={currentWord.imageUrl} />
        <div className="prompt-category">{currentWord.category}</div>
        <div className="prompt-text">{t.whatIsThis}</div>
      </div>

      {feedback === 'checking' && (
        <div className="feedback" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤔</div>
          <div style={{ color: 'var(--text-muted)' }}>{t.checking}</div>
        </div>
      )}

      {!feedback && (
        <>
          <div className="input-area">
            <MicButton lang={settings.language} onResult={handleSpeechResult} disabled={!!feedback} />
            <span className="or-divider">─── {t.type.split('...')[0]} ───</span>
            <div className="text-input-row">
              <input
                ref={inputRef}
                className="text-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkAnswer(input)}
                placeholder={t.type}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button className="submit-btn" onClick={() => checkAnswer(input)} disabled={!input.trim()}>
                {t.check}
              </button>
            </div>
          </div>

          <HintBar
            word={currentWord.word}
            lang={settings.language}
            hintLevel={hintLevel}
            onRequestHint={() => setHintLevel(prev => Math.min(prev + 1, 4))}
            maxHints={4}
          />
        </>
      )}

      {feedback && (
        <div className={`feedback ${feedback}`}>
          <div className="feedback-icon">{feedback === 'correct' ? '🎉' : '💪'}</div>
          <div className="feedback-text">
            {feedback === 'correct'
              ? t.encouragements[Math.floor(Math.random() * t.encouragements.length)]
              : t.incorrect}
          </div>
          {feedback === 'correct' && (
            <div className="feedback-answer" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text)', marginTop: '4px' }}>
              {currentWord.word}
            </div>
          )}
          {feedback === 'incorrect' && (
            <div className="feedback-answer">{t.theAnswerWas} <strong>{currentWord.word}</strong></div>
          )}
          <button className="next-btn" onClick={handleNext}>
            {currentIndex < words.length - 1 ? t.next : t.finish} →
          </button>
        </div>
      )}
    </div>
  );
}

// --- SENTENCE FILL EXERCISE ---
function SentenceFill({ settings, onFinish }) {
  const t = TEXTS[settings.language] || TEXTS.nl;
  const data = getWordData(settings.language);
  const ROUND_SIZE = 8;

  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roundKey, setRoundKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [results, setResults] = useState([]);

  // Load sentences: AI-generated or local fallback
  useEffect(() => {
    let cancelled = false;
    async function loadSentences() {
      setLoading(true);
      setCurrentIndex(0);
      setResults([]);
      setFeedback(null);
      setInput('');
      setHintLevel(0);

      const mastered = AppStorage.getMasteredWords();

      // Try AI generation when API key is set
      if (settings.aiApiKey) {
        const aiSentences = await generateAISentences(settings.language, settings.difficulty, ROUND_SIZE, mastered);
        if (!cancelled && aiSentences && aiSentences.length > 0) {
          setSentences(aiSentences);
          setLoading(false);
          return;
        }
      }

      // Fallback: local sentences, filtering out mastered answers
      if (!cancelled) {
        let pool = [];
        if (settings.difficulty === 'easy') pool = [...data.sentences.easy];
        else if (settings.difficulty === 'medium') pool = [...data.sentences.easy, ...data.sentences.medium];
        else pool = [...data.sentences.easy, ...data.sentences.medium, ...data.sentences.hard];
        const available = pool.filter(s => !mastered.includes(s.answer.toLowerCase()));
        const finalPool = available.length >= ROUND_SIZE ? available : pool;
        setSentences(shuffleArray(finalPool).slice(0, ROUND_SIZE));
        setLoading(false);
      }
    }
    loadSentences();
    return () => { cancelled = true; };
  }, [roundKey]);

  const currentSentence = sentences[currentIndex];
  const isRoundComplete = !loading && sentences.length > 0 && currentIndex >= sentences.length;

  const checkAnswer = useCallback(async (answer, speechAlts) => {
    if (!answer || feedback || !currentSentence) return;
    const allAnswers = [currentSentence.answer, ...(currentSentence.alts || [])];
    const allAttempts = [answer, ...(speechAlts || [])];
    let isCorrect = allAttempts.some(attempt =>
      allAnswers.some(valid => wordFormsMatch(attempt, valid))
    );

    if (!isCorrect && settings.aiApiKey) {
      setFeedback('checking');
      const aiResult = await checkAnswerWithAI(answer, currentSentence.answer, currentSentence.alts || [], settings.language, 'sentence');
      if (aiResult === true) isCorrect = true;
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setResults(prev => [...prev, isCorrect]);

    if (isCorrect) {
      AppStorage.addMasteredWord(currentSentence.answer);
    }

    const stats = AppStorage.recordAnswer(isCorrect);
    if (settings.soundEnabled) {
      if (isCorrect) {
        SoundFX.playCorrect();
        if (stats.currentStreak > 0 && stats.currentStreak % 5 === 0) {
          SoundFX.playStreak();
        }
        ConfettiFX.launch();
      } else {
        SoundFX.playIncorrect();
      }
    }
  }, [currentSentence, feedback, settings]);

  const handleNext = () => {
    setFeedback(null);
    setInput('');
    setHintLevel(0);
    setCurrentIndex(prev => prev + 1);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="exercise" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ fontSize: '2.5rem', marginBottom: '16px', animation: 'spin 1.5s linear infinite' }}>🔄</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t.loading}</div>
        </div>
      </div>
    );
  }

  if (isRoundComplete) {
    const score = results.filter(Boolean).length;
    AppStorage.saveSession({
      exerciseType: 'sentenceFill',
      score,
      total: sentences.length,
      difficulty: settings.difficulty,
      language: settings.language,
    });
    return <ResultScreen score={score} total={sentences.length} onHome={() => onFinish()} onRetry={() => {
      setRoundKey(k => k + 1);
    }} settings={settings} />;
  }

  if (!currentSentence) return null;

  // Render sentence with blank
  const parts = currentSentence.sentence.split('___');

  return (
    <div className="exercise">
      <div className="exercise-top">
        <button className="back-btn" onClick={() => onFinish()}>←</button>
        <div className="progress-dots">
          {sentences.map((_, i) => (
            <div key={i} className={`progress-dot ${i < currentIndex ? (results[i] ? 'done' : 'wrong') : i === currentIndex ? 'current' : ''}`} />
          ))}
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentIndex + 1}/{sentences.length}</span>
      </div>

      <div className="exercise-prompt" style={{ paddingTop: '30px' }}>
        <div className="prompt-text" style={{ marginBottom: '16px' }}>{t.fillBlank}</div>
        <div className="prompt-sentence">
          {parts[0]}<span className="blank">{input || '?'}</span>{parts[1] || ''}
        </div>
      </div>

      {feedback === 'checking' && (
        <div className="feedback" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤔</div>
          <div style={{ color: 'var(--text-muted)' }}>{t.checking}</div>
        </div>
      )}

      {!feedback && (
        <>
          <div className="input-area">
            <MicButton lang={settings.language} onResult={(transcript, alternatives) => {
              setInput(transcript);
              checkAnswer(transcript, alternatives);
            }} disabled={!!feedback} />
            <span className="or-divider">─── {t.type.split('...')[0]} ───</span>
            <div className="text-input-row">
              <input
                className="text-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkAnswer(input)}
                placeholder={t.type}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button className="submit-btn" onClick={() => checkAnswer(input)} disabled={!input.trim()}>
                {t.check}
              </button>
            </div>
          </div>

          <HintBar
            word={currentSentence.answer}
            lang={settings.language}
            hintLevel={hintLevel}
            onRequestHint={() => setHintLevel(prev => Math.min(prev + 1, 4))}
            maxHints={4}
          />
          {hintLevel === 0 && currentSentence.hint && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              💡 {currentSentence.hint}
            </div>
          )}
        </>
      )}

      {feedback && (
        <div className={`feedback ${feedback}`}>
          <div className="feedback-icon">{feedback === 'correct' ? '🎉' : '💪'}</div>
          <div className="feedback-text">
            {feedback === 'correct'
              ? t.encouragements[Math.floor(Math.random() * t.encouragements.length)]
              : t.incorrect}
          </div>
          {feedback === 'correct' && (
            <div className="feedback-answer" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text)', marginTop: '4px' }}>
              {currentSentence.answer}
            </div>
          )}
          {feedback === 'incorrect' && (
            <div className="feedback-answer">{t.theAnswerWas} <strong>{currentSentence.answer}</strong></div>
          )}
          <button className="next-btn" onClick={handleNext}>
            {currentIndex < sentences.length - 1 ? t.next : t.finish} →
          </button>
        </div>
      )}
    </div>
  );
}

// --- WORD REPEAT EXERCISE ---
function WordRepeat({ settings, onFinish }) {
  const t = TEXTS[settings.language] || TEXTS.nl;
  const data = getWordData(settings.language);
  const categories = Object.values(data.categories);
  const ROUND_SIZE = 8;

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roundKey, setRoundKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [hasListened, setHasListened] = useState(false);

  // Load words: AI-generated or local fallback
  useEffect(() => {
    let cancelled = false;
    async function loadWords() {
      setLoading(true);
      setCurrentIndex(0);
      setResults([]);
      setFeedback(null);
      setHasListened(false);

      const mastered = AppStorage.getMasteredWords();

      // Try AI generation when API key is set
      if (settings.aiApiKey) {
        const aiWords = await generateAIWords(settings.language, settings.difficulty, ROUND_SIZE, mastered);
        if (!cancelled && aiWords && aiWords.length > 0) {
          setWords(aiWords);
          setLoading(false);
          return;
        }
      }

      // Fallback: local words, filtering out mastered
      if (!cancelled) {
        const allWords = categories.flatMap(cat =>
          getWordsForDifficulty(cat, settings.difficulty).map(w => ({ ...w, category: cat.name }))
        );
        const available = allWords.filter(w => !mastered.includes(w.word.toLowerCase()));
        const pool = available.length >= ROUND_SIZE ? available : allWords;
        setWords(shuffleArray(pool).slice(0, ROUND_SIZE));
        setLoading(false);
      }
    }
    loadWords();
    return () => { cancelled = true; };
  }, [roundKey]);

  const currentWord = words[currentIndex];
  const isRoundComplete = !loading && words.length > 0 && currentIndex >= words.length;

  const handleListen = () => {
    if (!currentWord) return;
    speakWord(currentWord.word, settings.language);
    setHasListened(true);
  };

  const handleSpeechResult = async (transcript, alternatives) => {
    if (!currentWord) return;
    // Try primary transcript and all speech recognition alternatives
    const allAttempts = [transcript, ...(alternatives || [])];
    let isCorrect = allAttempts.some(attempt => wordFormsMatch(attempt, currentWord.word));

    if (!isCorrect && settings.aiApiKey) {
      setFeedback('checking');
      const aiResult = await checkAnswerWithAI(transcript, currentWord.word, currentWord.alts || [], settings.language, 'repeat');
      if (aiResult === true) isCorrect = true;
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setResults(prev => [...prev, isCorrect]);

    if (isCorrect) {
      AppStorage.addMasteredWord(currentWord.word);
    }

    const stats = AppStorage.recordAnswer(isCorrect);
    if (settings.soundEnabled) {
      if (isCorrect) {
        SoundFX.playCorrect();
        if (stats.currentStreak > 0 && stats.currentStreak % 5 === 0) {
          SoundFX.playStreak();
        }
        ConfettiFX.launch();
      } else {
        SoundFX.playIncorrect();
      }
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setHasListened(false);
    setCurrentIndex(prev => prev + 1);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="exercise" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ fontSize: '2.5rem', marginBottom: '16px', animation: 'spin 1.5s linear infinite' }}>🔄</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t.loading}</div>
        </div>
      </div>
    );
  }

  if (isRoundComplete) {
    const score = results.filter(Boolean).length;
    AppStorage.saveSession({
      exerciseType: 'wordRepeat',
      score,
      total: words.length,
      difficulty: settings.difficulty,
      language: settings.language,
    });
    return <ResultScreen score={score} total={words.length} onHome={() => onFinish()} onRetry={() => {
      setRoundKey(k => k + 1);
    }} settings={settings} />;
  }

  if (!currentWord) return null;

  return (
    <div className="exercise">
      <div className="exercise-top">
        <button className="back-btn" onClick={() => onFinish()}>←</button>
        <div className="progress-dots">
          {words.map((_, i) => (
            <div key={i} className={`progress-dot ${i < currentIndex ? (results[i] ? 'done' : 'wrong') : i === currentIndex ? 'current' : ''}`} />
          ))}
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentIndex + 1}/{words.length}</span>
      </div>

      <div className="exercise-prompt" style={{ paddingTop: '20px' }}>
        <div className="prompt-text" style={{ marginBottom: '24px' }}>
          {!hasListened ? t.listenWord : t.repeatWord}
        </div>

        {!hasListened ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button className="listen-btn" onClick={handleListen}>
              🔊
            </button>
            <span className="mic-label">{t.tapToListen}</span>
          </div>
        ) : !feedback ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              🔊 <button onClick={handleListen} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1rem', textDecoration: 'underline', fontFamily: 'inherit' }}>
                {t.tapToListen}
              </button>
            </div>
            <MicButton lang={settings.language} onResult={handleSpeechResult} disabled={!!feedback} />
          </div>
        ) : null}
      </div>

      {feedback === 'checking' && (
        <div className="feedback" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤔</div>
          <div style={{ color: 'var(--text-muted)' }}>{t.checking}</div>
        </div>
      )}

      {feedback && feedback !== 'checking' && (
        <div className={`feedback ${feedback}`}>
          <div className="feedback-icon">{feedback === 'correct' ? '🎉' : '💪'}</div>
          <div className="feedback-text">
            {feedback === 'correct'
              ? t.encouragements[Math.floor(Math.random() * t.encouragements.length)]
              : t.incorrect}
          </div>
          <div className="feedback-answer" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text)', marginTop: '8px' }}>
            {currentWord.word}
          </div>
          {feedback === 'incorrect' && (
            <button onClick={() => speakWord(currentWord.word, settings.language)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1rem', marginTop: '8px', textDecoration: 'underline', fontFamily: 'inherit' }}>
              🔊 {t.listenWord}
            </button>
          )}
          <button className="next-btn" onClick={handleNext}>
            {currentIndex < words.length - 1 ? t.next : t.finish} →
          </button>
        </div>
      )}
    </div>
  );
}

// --- RESULT SCREEN ---
function ResultScreen({ score, total, onHome, onRetry, settings }) {
  const t = TEXTS[settings.language] || TEXTS.nl;
  const pct = Math.round((score / total) * 100);
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
  const stats = AppStorage.getStats();

  // Check adaptive difficulty
  const [diffMessage, setDiffMessage] = useState(null);
  useEffect(() => {
    if (!settings.autoAdjust) return;
    const rec = AppStorage.getRecommendedDifficulty();
    if (rec === 'up' && settings.difficulty !== 'hard') {
      const newDiff = settings.difficulty === 'easy' ? 'medium' : 'hard';
      setDiffMessage({ dir: 'up', newDiff });
    } else if (rec === 'down' && settings.difficulty !== 'easy') {
      const newDiff = settings.difficulty === 'hard' ? 'medium' : 'easy';
      setDiffMessage({ dir: 'down', newDiff });
    }
  }, []);

  let emoji = '🌟';
  let message = t.keepGoing;
  if (pct >= 90) { emoji = '🏆'; message = t.amazing; }
  else if (pct >= 60) { emoji = '⭐'; message = t.wellDone; }
  else if (pct >= 30) { emoji = '💪'; message = t.keepGoing; }
  else { emoji = '🌱'; message = t.tryHarder; }

  return (
    <div className="result-screen">
      <div className="result-emoji">{emoji}</div>
      <h2>{message}</h2>
      <div className="result-score">{pct}%</div>
      <div className="result-detail">{score} / {total} {t.correct.toLowerCase()}</div>
      <div className="stars">
        {[1, 2, 3].map(i => (
          <span key={i} className={`star ${i <= stars ? 'earned' : ''}`} style={{ animationDelay: `${i * 0.15}s` }}>⭐</span>
        ))}
      </div>
      {stats.currentStreak >= 3 && (
        <div style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '1.1rem' }}>
          🔥 {stats.currentStreak} {t.streak}
        </div>
      )}
      {diffMessage && (
        <div style={{
          padding: '10px 20px',
          background: diffMessage.dir === 'up' ? '#E8F5E9' : '#FFF3E0',
          borderRadius: 'var(--radius-sm)',
          color: diffMessage.dir === 'up' ? '#2E7D32' : '#E65100',
          fontWeight: '600',
          fontSize: '0.9rem',
        }}>
          {diffMessage.dir === 'up' ? '📈' : '📉'} {diffMessage.dir === 'up' ? t.levelUp : t.levelDown}
        </div>
      )}
      <div className="result-actions">
        <button className="result-btn secondary" onClick={onHome}>🏠</button>
        <button className="result-btn primary" onClick={onRetry}>🔄 {t.next}</button>
      </div>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard({ settings }) {
  const t = TEXTS[settings.language] || TEXTS.nl;
  const stats = AppStorage.getStats();
  const sessions = AppStorage.getSessions();
  const accuracy = stats.totalExercises > 0
    ? Math.round((stats.totalCorrect / stats.totalExercises) * 100)
    : 0;

  const recentSessions = sessions.slice(-10).reverse();

  const exerciseNames = {
    pictureNaming: t.pictureNaming,
    sentenceFill: t.sentenceFill,
    wordRepeat: t.wordRepeat,
  };

  return (
    <div className="dashboard">
      <h2>{t.dashboard}</h2>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.totalExercises}</div>
          <div className="stat-label">{t.totalExercises}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">{t.accuracy}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🔥 {stats.currentStreak}</div>
          <div className="stat-label">{t.currentStreak}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">⭐ {stats.bestStreak}</div>
          <div className="stat-label">{t.bestStreak}</div>
        </div>
      </div>

      <h3 style={{ marginTop: '8px' }}>{t.history}</h3>
      <div className="history-list">
        {recentSessions.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
            {t.noHistory}
          </div>
        )}
        {recentSessions.map((s, i) => (
          <div className="history-item" key={i}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{exerciseNames[s.exerciseType] || s.exerciseType}</div>
              <div className="history-date">{new Date(s.date).toLocaleDateString(settings.language === 'nl' ? 'nl-NL' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="history-score">{s.score}/{s.total}</div>
              <div className={`difficulty-badge ${s.difficulty}`}>{t[s.difficulty]}</div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length > 0 && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="export-btn" onClick={() => ExportUtil.shareReport(sessions, stats, settings.language)} style={{ flex: 1 }}>
            📤 {t.export}
          </button>
          <button className="export-btn" onClick={() => ExportUtil.downloadReport(sessions, stats, settings.language)} style={{ flex: 1 }}>
            📥 {t.download}
          </button>
        </div>
      )}
    </div>
  );
}

// --- SETTINGS ---
function SettingsScreen({ settings, onUpdateSettings }) {
  const t = TEXTS[settings.language] || TEXTS.nl;

  const update = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    AppStorage.saveSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  return (
    <div className="settings">
      <h2>{t.settings}</h2>

      <div className="setting-group">
        <label>{t.language}</label>
        <div className="setting-options">
          <button className={`setting-option ${settings.language === 'nl' ? 'active' : ''}`} onClick={() => update('language', 'nl')}>
            🇳🇱 Nederlands
          </button>
          <button className={`setting-option ${settings.language === 'en' ? 'active' : ''}`} onClick={() => update('language', 'en')}>
            🇬🇧 English
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label>{t.difficulty}</label>
        <div className="setting-options">
          <button className={`setting-option ${settings.difficulty === 'easy' ? 'active' : ''}`} onClick={() => update('difficulty', 'easy')}>
            {t.easy}
          </button>
          <button className={`setting-option ${settings.difficulty === 'medium' ? 'active' : ''}`} onClick={() => update('difficulty', 'medium')}>
            {t.medium}
          </button>
          <button className={`setting-option ${settings.difficulty === 'hard' ? 'active' : ''}`} onClick={() => update('difficulty', 'hard')}>
            {t.hard}
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label>{t.autoAdjust}</label>
        <div className="setting-options">
          <button className={`setting-option ${settings.autoAdjust ? 'active' : ''}`} onClick={() => update('autoAdjust', true)}>
            {t.on}
          </button>
          <button className={`setting-option ${!settings.autoAdjust ? 'active' : ''}`} onClick={() => update('autoAdjust', false)}>
            {t.off}
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label>{t.sound}</label>
        <div className="setting-options">
          <button className={`setting-option ${settings.soundEnabled ? 'active' : ''}`} onClick={() => update('soundEnabled', true)}>
            🔊 {t.on}
          </button>
          <button className={`setting-option ${!settings.soundEnabled ? 'active' : ''}`} onClick={() => update('soundEnabled', false)}>
            🔇 {t.off}
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label>{t.aiApiKey}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="password"
            className="text-input"
            value={settings.aiApiKey || ''}
            onChange={e => update('aiApiKey', e.target.value.trim())}
            placeholder={t.aiApiKeyPlaceholder}
            style={{ fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
            autoComplete="off"
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {t.aiApiKeyHelp} — <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style={{ color: 'var(--primary)' }}>aistudio.google.com/apikey</a>
          </div>
          {settings.aiApiKey && (
            <div style={{ fontSize: '0.8rem', color: '#4CAF50', fontWeight: '600' }}>
              ✓ {t.aiEnabled}
            </div>
          )}
        </div>
      </div>

      <button
        className="export-btn"
        style={{ borderColor: 'var(--error)', color: 'var(--error)', marginTop: '16px' }}
        onClick={() => {
          if (confirm(t.clearConfirm)) {
            AppStorage.clearAll();
            onUpdateSettings(AppStorage.getSettings());
          }
        }}
      >
        🗑️ {t.clearData}
      </button>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

function App() {
  const [settings, setSettings] = useState(() => AppStorage.getSettings());
  const [screen, setScreen] = useState('home'); // 'home' | 'pictureNaming' | 'sentenceFill' | 'wordRepeat' | 'dashboard' | 'settings'
  const [tab, setTab] = useState('home'); // nav tab
  const t = TEXTS[settings.language] || TEXTS.nl;
  const stats = AppStorage.getStats();

  const handleNav = (newTab) => {
    if (settings.soundEnabled) SoundFX.playClick();
    setTab(newTab);
    setScreen(newTab);
  };

  const startExercise = (type) => {
    if (settings.soundEnabled) SoundFX.playClick();
    // Apply adaptive difficulty before starting
    if (settings.autoAdjust) {
      const rec = AppStorage.getRecommendedDifficulty();
      if (rec === 'up' && settings.difficulty !== 'hard') {
        const newDiff = settings.difficulty === 'easy' ? 'medium' : 'hard';
        const newSettings = { ...settings, difficulty: newDiff };
        AppStorage.saveSettings(newSettings);
        setSettings(newSettings);
      } else if (rec === 'down' && settings.difficulty !== 'easy') {
        const newDiff = settings.difficulty === 'hard' ? 'medium' : 'easy';
        const newSettings = { ...settings, difficulty: newDiff };
        AppStorage.saveSettings(newSettings);
        setSettings(newSettings);
      }
    }
    setScreen(type);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'pictureNaming':
        return <PictureNaming settings={settings} onFinish={() => { setScreen('home'); setTab('home'); }} />;
      case 'sentenceFill':
        return <SentenceFill settings={settings} onFinish={() => { setScreen('home'); setTab('home'); }} />;
      case 'wordRepeat':
        return <WordRepeat settings={settings} onFinish={() => { setScreen('home'); setTab('home'); }} />;
      case 'dashboard':
        return <Dashboard settings={settings} />;
      case 'settings':
        return <SettingsScreen settings={settings} onUpdateSettings={setSettings} />;
      default:
        return (
          <div className="home">
            <div className="home-greeting">
              <h2>{t.greeting} 👋</h2>
              <p>{t.greetingSub}</p>
            </div>
            <div className="exercise-cards">
              <button className="exercise-card" onClick={() => startExercise('pictureNaming')}>
                <span className="card-emoji">🖼️</span>
                <div className="card-info">
                  <h3>{t.pictureNaming}</h3>
                  <p>{t.pictureNamingDesc}</p>
                  <span className={`difficulty-badge ${settings.difficulty}`}>{t[settings.difficulty]}</span>
                </div>
              </button>
              <button className="exercise-card" onClick={() => startExercise('sentenceFill')}>
                <span className="card-emoji">✏️</span>
                <div className="card-info">
                  <h3>{t.sentenceFill}</h3>
                  <p>{t.sentenceFillDesc}</p>
                  <span className={`difficulty-badge ${settings.difficulty}`}>{t[settings.difficulty]}</span>
                </div>
              </button>
              <button className="exercise-card" onClick={() => startExercise('wordRepeat')}>
                <span className="card-emoji">🔊</span>
                <div className="card-info">
                  <h3>{t.wordRepeat}</h3>
                  <p>{t.wordRepeatDesc}</p>
                  <span className={`difficulty-badge ${settings.difficulty}`}>{t[settings.difficulty]}</span>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  const isExercise = ['pictureNaming', 'sentenceFill', 'wordRepeat'].includes(screen);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🗣️ {t.appTitle}</h1>
        {stats.currentStreak >= 3 && (
          <div className="streak-badge">🔥 {stats.currentStreak}</div>
        )}
      </header>

      <main className="app-body">
        {renderScreen()}
      </main>

      {!isExercise && (
        <nav className="app-nav">
          <button className={`nav-btn ${tab === 'home' ? 'active' : ''}`} onClick={() => handleNav('home')}>
            <span className="nav-icon">🏠</span>
            {t.home}
          </button>
          <button className={`nav-btn ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => handleNav('dashboard')}>
            <span className="nav-icon">📊</span>
            {t.dashboard}
          </button>
          <button className={`nav-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => handleNav('settings')}>
            <span className="nav-icon">⚙️</span>
            {t.settings}
          </button>
        </nav>
      )}
    </div>
  );
}

// ============================================================
// MOUNT
// ============================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
