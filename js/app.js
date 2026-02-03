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
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      // Check all alternatives for best match
      const results = [];
      for (let i = 0; i < event.results[0].length; i++) {
        results.push(event.results[0][i].transcript.toLowerCase().trim());
      }
      setTranscript(results[0]); // Use best result
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
  }, []);

  return { isListening, transcript, isSupported, startListening, stopListening, resetTranscript };
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
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition(lang);
  const settings = AppStorage.getSettings();
  const t = TEXTS[settings.language] || TEXTS.nl;

  useEffect(() => {
    if (transcript && !isListening) {
      onResult(transcript);
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
function ImageDisplay({ word, emoji, lang }) {
  const [imgError, setImgError] = useState(false);
  const map = window.IMAGE_MAP || {};
  const imageUrl = map[word];

  // Reset error state when word changes
  useEffect(() => { setImgError(false); }, [word]);

  if (!imageUrl || imgError) {
    return (
      <div className="prompt-image-container">
        <div className="prompt-emoji">{emoji}</div>
      </div>
    );
  }

  return (
    <div className="prompt-image-container">
      <img
        className="prompt-image"
        src={imageUrl}
        alt=""
        onError={() => setImgError(true)}
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

  const [words, setWords] = useState(() => {
    const allWords = categories.flatMap(cat =>
      getWordsForDifficulty(cat, settings.difficulty).map(w => ({ ...w, category: cat.name }))
    );
    return shuffleArray(allWords).slice(0, ROUND_SIZE);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  const currentWord = words[currentIndex];
  const isRoundComplete = currentIndex >= words.length;

  const checkAnswer = useCallback((answer) => {
    if (!answer || feedback) return;
    const allValid = [currentWord.word, ...(currentWord.alts || [])];
    const isCorrect = allValid.some(valid => wordFormsMatch(answer, valid));
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setResults(prev => [...prev, isCorrect]);

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

  const handleSpeechResult = (transcript) => {
    setInput(transcript);
    checkAnswer(transcript);
  };

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
      const allWords = categories.flatMap(cat =>
        getWordsForDifficulty(cat, settings.difficulty).map(w => ({ ...w, category: cat.name }))
      );
      setWords(shuffleArray(allWords).slice(0, ROUND_SIZE));
      setCurrentIndex(0);
      setResults([]);
      setFeedback(null);
      setInput('');
      setHintLevel(0);
    }} settings={settings} />;
  }

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
        <ImageDisplay word={currentWord.word} emoji={currentWord.emoji} lang={settings.language} />
        <div className="prompt-category">{currentWord.category}</div>
        <div className="prompt-text">{t.whatIsThis}</div>
      </div>

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
              {currentWord.emoji} {currentWord.word}
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

  const [sentences, setSentences] = useState(() => {
    let pool = [];
    if (settings.difficulty === 'easy') pool = [...data.sentences.easy];
    else if (settings.difficulty === 'medium') pool = [...data.sentences.easy, ...data.sentences.medium];
    else pool = [...data.sentences.easy, ...data.sentences.medium, ...data.sentences.hard];
    return shuffleArray(pool).slice(0, ROUND_SIZE);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [results, setResults] = useState([]);

  const currentSentence = sentences[currentIndex];
  const isRoundComplete = currentIndex >= sentences.length;

  const checkAnswer = useCallback((answer) => {
    if (!answer || feedback) return;
    // Check against primary answer AND all alternates
    const allAnswers = [currentSentence.answer, ...(currentSentence.alts || [])];
    const isCorrect = allAnswers.some(valid => wordFormsMatch(answer, valid));
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setResults(prev => [...prev, isCorrect]);

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
      let pool = [];
      if (settings.difficulty === 'easy') pool = [...data.sentences.easy];
      else if (settings.difficulty === 'medium') pool = [...data.sentences.easy, ...data.sentences.medium];
      else pool = [...data.sentences.easy, ...data.sentences.medium, ...data.sentences.hard];
      setSentences(shuffleArray(pool).slice(0, ROUND_SIZE));
      setCurrentIndex(0);
      setResults([]);
      setFeedback(null);
      setInput('');
      setHintLevel(0);
    }} settings={settings} />;
  }

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

      {!feedback && (
        <>
          <div className="input-area">
            <MicButton lang={settings.language} onResult={(transcript) => {
              setInput(transcript);
              checkAnswer(transcript);
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

  const [words, setWords] = useState(() => {
    const allWords = categories.flatMap(cat =>
      getWordsForDifficulty(cat, settings.difficulty).map(w => ({ ...w, category: cat.name }))
    );
    return shuffleArray(allWords).slice(0, ROUND_SIZE);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [hasListened, setHasListened] = useState(false);

  const currentWord = words[currentIndex];
  const isRoundComplete = currentIndex >= words.length;

  const handleListen = () => {
    speakWord(currentWord.word, settings.language);
    setHasListened(true);
  };

  const handleSpeechResult = (transcript) => {
    const isCorrect = wordFormsMatch(transcript, currentWord.word);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setResults(prev => [...prev, isCorrect]);

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
      const allWords = categories.flatMap(cat =>
        getWordsForDifficulty(cat, settings.difficulty).map(w => ({ ...w, category: cat.name }))
      );
      setWords(shuffleArray(allWords).slice(0, ROUND_SIZE));
      setCurrentIndex(0);
      setResults([]);
      setFeedback(null);
      setHasListened(false);
    }} settings={settings} />;
  }

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

      {feedback && (
        <div className={`feedback ${feedback}`}>
          <div className="feedback-icon">{feedback === 'correct' ? '🎉' : '💪'}</div>
          <div className="feedback-text">
            {feedback === 'correct'
              ? t.encouragements[Math.floor(Math.random() * t.encouragements.length)]
              : t.incorrect}
          </div>
          <div className="feedback-answer" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text)', marginTop: '8px' }}>
            {currentWord.emoji} {currentWord.word}
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
