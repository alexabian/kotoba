import { useState, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { PAIRS } from './data';
import './App.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWord(card) {
  return card.word ?? '';
}

// For cross-pair cards we zip the two card lists at matching indices.
// If lengths differ, we cap at the shorter one.
function buildDeck(pair) {
  const len = Math.min(pair.dataA.length, pair.dataB.length);
  const deck = [];
  for (let i = 0; i < len; i++) {
    deck.push({ cardA: pair.dataA[i], cardB: pair.dataB[i] });
  }
  return deck;
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
        <p className="settings-hint">Choose a language pair</p>

        <div className="pair-list">
          {PAIRS.map((pair) => (
            <button
              key={pair.id}
              className={`pair-option ${selected === pair.id ? 'selected' : ''}`}
              onClick={() => setSelected(pair.id)}
            >
              <span className="pair-dot" style={{ background: pair.colorA }} />
              <span className="pair-label">{pair.labelA}</span>
              <span className="pair-sep">+</span>
              <span className="pair-dot" style={{ background: pair.colorB }} />
              <span className="pair-label">{pair.labelB}</span>
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
  const isHiKa  = pair.id === 'hi-ka';

  const emoji = cardA.emoji !== '—' ? cardA.emoji : (cardB.emoji !== '—' ? cardB.emoji : '');
  const wordA  = getWord(cardA);
  const wordB  = getWord(cardB);

  return (
    <div className="card">
      {/* Emoji */}
      <div className="card-emoji">{emoji}</div>

      {/* Letter(s) */}
      <div className="card-letters">
        {isHiKa ? (
          <>
            <span className="letter letter-kana" style={{ color: pair.colorA }}>{cardA.letter}</span>
            <span className="letter-sep">/</span>
            <span className="letter letter-kana" style={{ color: pair.colorB }}>{cardB.letter}</span>
          </>
        ) : (
          <span
            className={`letter ${isKanaA ? 'letter-kana' : 'letter-latin'}`}
            style={{ color: pair.colorA }}
          >
            {cardA.letter}
          </span>
        )}
      </div>

      {/* Phonetic */}
      <div className="card-phonetic">
        <span className="phonetic">{cardA.phonetic}</span>
      </div>

      {/* Words */}
      <div className="card-words">
        <div className="word-block">
          <span className={`word-text ${isKanaA ? 'word-kana' : ''}`}>{wordA}</span>
          {isKanaA && cardA.wordRomaji && (
            <span className="word-romaji">{cardA.wordRomaji}</span>
          )}
          <span className="word-lang" style={{ color: pair.colorA }}>{pair.labelA}</span>
        </div>

        <div className="word-divider" />

        <div className="word-block">
          <span className={`word-text ${isKanaB ? 'word-kana' : ''}`}>{wordB}</span>
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

  const [index,    setIndex]    = useState(0);
  const [animKey,  setAnimKey]  = useState(0);
  const [animDir,  setAnimDir]  = useState('');

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
      <button className="settings-icon" onClick={onSettings} aria-label="Settings">⚙</button>

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
