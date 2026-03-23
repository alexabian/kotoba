import { useState, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { PAIRS } from './data';
import './App.css';

// ─── Deck builder ─────────────────────────────────────────────────────────────
// 'alphabet': match by letter value (handles Ñ offset in Spanish)
// 'kana':     zip by index (same sound position in both syllabaries)

function buildDeck(pair) {
  if (pair.mode === 'alphabet') {
    return pair.dataA
      .map((cardA) => {
        const cardB = pair.dataB.find((c) => c.letter === cardA.letter);
        return cardB ? { cardA, cardB } : null;
      })
      .filter(Boolean);
  }
  const len = Math.min(pair.dataA.length, pair.dataB.length);
  return Array.from({ length: len }, (_, i) => ({
    cardA: pair.dataA[i],
    cardB: pair.dataB[i],
  }));
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

function SettingsScreen({ onStart, currentPairId }) {
  const [selected, setSelected] = useState(currentPairId ?? PAIRS[0].id);

  return (
    <div className="settings-screen">
      <div className="settings-inner">
        <div className="app-title-block">
          <span className="app-title-jp">言葉</span>
          <span className="app-title-en">kotoba</span>
        </div>
        <p className="settings-hint">choose a language pair</p>

        <div className="pair-list">
          {PAIRS.map((pair) => (
            <button
              key={pair.id}
              className={`pair-option ${selected === pair.id ? 'selected' : ''}`}
              onClick={() => setSelected(pair.id)}
            >
              <div className="pair-preview">
                <div className="pair-half">
                  <span className="pair-char" style={{ color: pair.colorA,
                    fontFamily: pair.scriptA === 'kana' ? "'Noto Sans JP', sans-serif" : "'DM Serif Display', serif" }}>
                    {pair.previewA}
                  </span>
                  <span className="pair-lang" style={{ color: pair.colorA }}>
                    <span className="pair-flag">{pair.flagA}</span> {pair.labelA}
                  </span>
                </div>
                <div className="pair-divider" />
                <div className="pair-half">
                  <span className="pair-char" style={{ color: pair.colorB,
                    fontFamily: pair.scriptB === 'kana' ? "'Noto Sans JP', sans-serif" : "'DM Serif Display', serif" }}>
                    {pair.previewB}
                  </span>
                  <span className="pair-lang" style={{ color: pair.colorB }}>
                    <span className="pair-flag">{pair.flagB}</span> {pair.labelB}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button className="start-btn" onClick={() => onStart(selected)}>
          Start
        </button>
      </div>
    </div>
  );
}

// ─── Flash Card ───────────────────────────────────────────────────────────────

function FlashCard({ cardA, cardB, pair }) {
  const isKanaA = pair.scriptA === 'kana';
  const isKanaB = pair.scriptB === 'kana';
  const isHiKa  = pair.mode === 'kana'; // Hiragana+Katakana: both characters as co-heroes

  return (
    <div className="card">
      {/* Letter(s) */}
      <div className="card-letters">
        {isHiKa ? (
          // Hiragana + Katakana: both characters as co-heroes
          <>
            <span className="letter letter-kana" style={{ color: pair.colorA }}>{cardA.letter}</span>
            <span className="letter-sep">/</span>
            <span className="letter letter-kana" style={{ color: pair.colorB }}>{cardB.letter}</span>
          </>
        ) : (
          // All other pairs: one dominant letter (always cardA)
          <span
            className={`letter ${isKanaA ? 'letter-kana' : 'letter-latin'}`}
            style={{ color: pair.colorA }}
          >
            {cardA.letter}
          </span>
        )}
      </div>

      {/* Phonetic — always from cardA */}
      <div className="card-phonetic">
        <span className="phonetic">{cardA.phonetic}</span>
      </div>

      {/* Words */}
      <div className="card-words">
        {/* Side A */}
        <div className="word-block">
          {cardA.emoji && cardA.emoji !== '—' && (
            <span className="word-emoji">{cardA.emoji}</span>
          )}
          <span className={`word-text ${isKanaA ? 'word-kana' : ''}`}>{cardA.word}</span>
          {isKanaA && cardA.wordRomaji && (
            <span className="word-romaji">{cardA.wordRomaji}</span>
          )}
          <span className="word-lang" style={{ color: pair.colorA }}>{pair.labelA}</span>
        </div>

        <div className="word-divider" />

        {/* Side B */}
        <div className="word-block">
          {cardB.emoji && cardB.emoji !== '—' && (
            <span className="word-emoji">{cardB.emoji}</span>
          )}
          <span className={`word-text ${isKanaB ? 'word-kana' : ''}`}>{cardB.word}</span>
          {isKanaB && cardB.wordRomaji && (
            <span className="word-romaji">{cardB.wordRomaji}</span>
          )}
          <span className="word-lang" style={{ color: pair.colorB }}>{pair.labelB}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Card Deck ────────────────────────────────────────────────────────────────

function CardDeck({ pairId, onSettings }) {
  const pair  = PAIRS.find((p) => p.id === pairId);
  const deck  = buildDeck(pair);

  const [index,   setIndex]   = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [animDir, setAnimDir] = useState('');

  const navigate = useCallback((dir) => {
    const next = index + dir;
    if (next < 0 || next >= deck.length) return;
    setAnimDir(dir > 0 ? 'slide-left' : 'slide-right');
    setAnimKey((k) => k + 1);
    setIndex(next);
  }, [index, deck.length]);

  const handlers = useSwipeable({
    onSwipedLeft:  () => navigate(+1),
    onSwipedRight: () => navigate(-1),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const { cardA, cardB } = deck[index];

  return (
    <div className="deck-screen" {...handlers}>
      <button className="settings-icon" onClick={onSettings} aria-label="Back to menu" title="Back to menu">⌂</button>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${((index + 1) / deck.length) * 100}%`,
            background: pair.colorA,
          }}
        />
      </div>

      <div key={animKey} className={`card-wrapper ${animDir}`}>
        <FlashCard cardA={cardA} cardB={cardB} pair={pair} />
      </div>

      <div className="card-counter">{index + 1} / {deck.length}</div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activePairId, setActivePairId] = useState(null);

  if (!activePairId) {
    return (
      <SettingsScreen
        onStart={(id) => setActivePairId(id)}
        currentPairId={activePairId}
      />
    );
  }

  return (
    <CardDeck
      pairId={activePairId}
      onSettings={() => setActivePairId(null)}
    />
  );
}
