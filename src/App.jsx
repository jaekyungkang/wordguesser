import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

import confetti from "canvas-confetti";

// ---------------------------------------------------------------------------
// DESIGN TOKENS
// A restrained, professional palette: deep navy for structure, a muted gold
// for "correct" states and a muted rust for "incorrect" states (instead of
// saturated primary blue / yellow / orange). Sora carries headings, Inter
// carries body copy and controls, and IBM Plex Mono is reserved for the
// game's "data" — score, miss count, and the letter tiles — so the numbers
// read like a scoreboard rather than decoration.
// ---------------------------------------------------------------------------

const displayFont = "'Sora', 'Helvetica Neue', Arial, sans-serif";
const bodyFont = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const monoFont = "'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace";

const COLORS = {
  ink: "#1C2333",
  paper: "#F6F6F3",
  card: "#FFFFFF",
  primary: "#1E3A5F",
  primaryDark: "#152A45",
  primarySoft: "#E9EEF3",
  gold: "#B08A2E",
  goldSoft: "#F6ECD3",
  rust: "#96453A",
  rustSoft: "#F3E2DF",
  border: "#E2E4E8",
  muted: "#6B7280",
  white: "#FFFFFF",
};

const pageWrapperStyle = {
  minHeight: "100vh",
  width: "100%",
  backgroundColor: COLORS.paper,
  fontFamily: bodyFont,
};

const cardStyle = {
  padding: 40,
  maxWidth: 460,
  margin: "48px auto",
  backgroundColor: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(28,35,51,0.04), 0 12px 32px rgba(28,35,51,0.06)",
  fontFamily: bodyFont,
  color: COLORS.ink,
};

// small uppercase, letter-spaced eyebrow used above form fields/sections
const eyebrowStyle = {
  fontFamily: monoFont,
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: COLORS.muted,
  marginBottom: 6,
  display: "block",
};

// the page/game title: display face + a thin gold rule as the signature mark
const titleBlockStyle = {
  fontFamily: displayFont,
  fontWeight: 800,
  fontSize: "1.9rem",
  color: COLORS.primary,
  letterSpacing: "-0.02em",
  margin: 0,
};

const titleRuleStyle = {
  width: 44,
  height: 3,
  backgroundColor: COLORS.gold,
  borderRadius: 2,
  margin: "10px 0 0 0",
};

const primaryButtonStyle = {
  backgroundColor: COLORS.primary,
  color: COLORS.white,
  fontFamily: bodyFont,
  fontSize: "1rem",
  fontWeight: 600,
  borderRadius: 10,
  border: "none",
  padding: "10px 28px",
  textTransform: "none",
  boxShadow: "0 1px 2px rgba(21,42,69,0.15), 0 6px 16px rgba(21,42,69,0.18)",
};

// a small "stat" readout (Score / Missed) rendered in mono, scoreboard-style
const statLabelStyle = {
  fontFamily: monoFont,
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: COLORS.muted,
};

const statValueStyle = {
  fontFamily: monoFont,
  fontSize: "1.15rem",
  fontWeight: 700,
  color: COLORS.ink,
};

function App() {
  // load the two Google Fonts used by the design tokens above. Safe no-op
  // if it can't reach the network — the stacks fall back to system fonts.
  useEffect(() => {
    const id = "hangcat-font-link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // i want difficulties to be a slider
  const DIFFICULTIES = [
    { value: 1, label: "Easy" },
    { value: 2, label: "Medium" },
    { value: 3, label: "Hard" },
  ];

  const DIFFICULTY_POOLS = {
    1: [1, 2], // Easy
    2: [3], // Medium
    3: [4, 5], // Hard
  };

  // languages should be a select dropdown
  const LANGUAGES = [
    { name: "en", label: "English" },
    { name: "es", label: "Spanish" },
    { name: "it", label: "Italian" },
    { name: "de", label: "Germna" },
    { name: "fr", label: "French" },
  ];

  const CAT_STAGES = [
    "/catdrawings/0.png", // this is when theyre are 0 wrong guesses
    "/catdrawings/1.png",
    "/catdrawings/2.png",
    "/catdrawings/3.png",
    "/catdrawings/4.png",
    "/catdrawings/5.png",
    "/catdrawings/6.png",
    "/catdrawings/7.png",
    "/catdrawings/8.png",
    "/catdrawings/9.png",
    "/catdrawings/10.png",
  ];

  const DUCK_GIFS = [
    "https://media1.tenor.com/m/h6GYjdTawhwAAAAd/psyduck-confetti.gif",
    "https://media1.tenor.com/m/z9kjRT4yMXEAAAAd/duck-dance-duck.gif",
    "https://media1.tenor.com/m/XpXWABMIkMoAAAAd/pato-baile.gif",
    "https://media1.tenor.com/m/XclFYuGpS5UAAAAd/dancing-duck.gif",
  ];

  const [word, setWord] = useState("");
  // even tho theyre are words shorter than 5 characters, let's set min to 5 and max to 15
  const [charLength, setCharLength] = useState(5);
  const [difficulty, setDifficulty] = useState(1);
  const [language, setLanguage] = useState("en");
  //pre-stage, playing, loading, won, gameover
  const [mode, setMode] = useState("pre-stage");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  // {word, solved, points}
  const [wordHistory, setWordHistory] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationGif, setCelebrationGif] = useState("");
  const [usedWord, setUsedWord] = useState([]);
  const [playerName, setPlayerName] = useState("");

  // keyboard display for different languages
  const KEYBOARD_LAYOUTS = {
    en: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"],
    ],
    es: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"],
      ["z", "x", "c", "v", "b", "n", "m"],
    ],
    fr: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"],
      ["é", "è", "ê", "à", "ç", "ù"],
    ],
    de: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"],
      ["ä", "ö", "ü", "ß"],
    ],
    it: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"],
      ["à", "è", "é", "ì", "ò", "ù"],
    ],
  };

  // defaults to english keyboard
  const keyboardRows = KEYBOARD_LAYOUTS[language] || KEYBOARD_LAYOUTS.en;
  const maxWrong = 11; // number of incorrect guesses

  // fetches randomword from api based on user's settings and then starts playing mode once the word is retrieved
  const searchRandomWord = () => {
    setMode("loading");
    const pool = DIFFICULTY_POOLS[difficulty];
    const apiDiff = pool[Math.floor(Math.random() * pool.length)];

    // fetch method makes request to server
    fetch(
      `https://random-word-api.herokuapp.com/word?length=${charLength}&diff=${apiDiff}&lang=${language}`,
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const newWord = data[0].toLowerCase();

        // making sure the word hasnt already been used
        if (usedWord.includes(newWord)) {
          searchRandomWord();
          return;
        }

        setWord(newWord); // setting the word into the state
        setUsedWord((prev) => [...prev, newWord]);
        setGuessedLetters([]);
        setMode("playing");
      })
      .catch((error) => console.error(error));
  };

  // resets game counters and gets first randomword
  const startGame = () => {
    setScore(0);
    setWrongCount(0);
    setWordHistory([]);
    setUsedWord([]);
    searchRandomWord();
  };

  // handles single letter clicks, updates guessed letters, tracks misses, detects solved word, triggers celebration or gameover
  const guessLetter = (letter) => {
    // ignoring clicks if not playing
    if (mode !== "playing" || showCelebration) return;

    letter = letter.toLowerCase();
    if (guessedLetters.includes(letter)) return; // so user cant guess same user

    const nextGuessed = [...guessedLetters, letter];
    setGuessedLetters(nextGuessed);

    if (!word.includes(letter)) {
      // adds one to counter and also checks for gameover
      const nextWrong = wrongCount + 1;
      setWrongCount(nextWrong);

      if (nextWrong >= maxWrong) {
        // out of guesses, so record this word as unsolved and end the game
        setWordHistory((prev) => [...prev, { word, solved: false, points: 0 }]);
        setMode("gameover");
      }
    } else {
      // the guess is correct, so we're checking whether every letter in shown
      const solved = word.split("").every((ch) => nextGuessed.includes(ch));
      if (solved) {
        const points = word.length * difficulty;
        setScore((prev) => prev + points);
        setWordHistory((prev) => [...prev, { word, solved: true, points }]);

        // celebrate!!!! ducks andd confetti
        const randomGif =
          DUCK_GIFS[Math.floor(Math.random() * DUCK_GIFS.length)];
        setCelebrationGif(randomGif);
        setShowCelebration(true);
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });

        setTimeout(() => {
          setShowCelebration(false);
          searchRandomWord(); // move to the next word after the celebration
        }, 2000);
      }
    }
  };

  // ADD DUCK CONFETTI

  // game
  // u            store wrong guess, in state, and condition will draw next
  // import useState - have handleGuess function -> define constant of letter to be the guess
  // if randomword does not include letter, then wrongguess++
  // display word = randomword

  // returns to setup screen
  const reset = () => setMode("pre-stage");

  // this is the visual state
  const getKeyStyle = (letter) => {
    const used = guessedLetters.includes(letter);
    const wrong = used && !word.includes(letter);
    const correct = used && !wrong;

    let bg = COLORS.white;
    let color = COLORS.ink;
    let borderColor = COLORS.border;
    if (correct) {
      bg = COLORS.goldSoft;
      color = COLORS.ink;
      borderColor = COLORS.gold;
    }
    if (wrong) {
      bg = COLORS.rustSoft;
      color = COLORS.rust;
      borderColor = COLORS.rust;
    }

    return {
      fontFamily: monoFont,
      fontWeight: 600,
      minWidth: 52,
      height: 52,
      borderRadius: 8,
      border: `1.5px solid ${borderColor}`,
      backgroundColor: bg,
      color,
      fontSize: "1.05rem",
      textTransform: "uppercase",
      boxShadow: used ? "none" : "0 1px 2px rgba(28,35,51,0.05)",
      transition: "background-color 0.15s ease, border-color 0.15s ease",
    };
  };

  // SETUP SCREEN!
  // gets name, word length, difficulty, and language
  if (mode === "pre-stage") {
    return (
      <div style={pageWrapperStyle}>
        <Grid container direction="column" spacing={3} style={cardStyle}>
          <Grid item>
            <Typography component="div" style={titleBlockStyle}>
              HangCat
            </Typography>
            <div style={titleRuleStyle} />
            <Typography
              variant="body1"
              style={{
                fontFamily: bodyFont,
                lineHeight: 1.6,
                marginTop: 16,
                color: COLORS.muted,
                fontSize: "0.95rem",
              }}
            >
              Guess the random word! Pick one letter at a time, and if it's in
              the word, it'll be shown in the correct position. If it's not,
              you'll be using one of your {maxWrong} guesses. You'll be given
              points for every word you guess correctly. The game ends once
              you've drawn the cat! Good luck!
            </Typography>
          </Grid>

          {/* player name required*/}
          <Grid item>
            <span style={eyebrowStyle}>Player</span>
            <TextField
              label="Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              fullWidth
              required
              size="small"
            />
          </Grid>

          <Grid item>
            <Typography
              gutterBottom
              style={{
                fontFamily: bodyFont,
                fontWeight: 600,
                color: COLORS.ink,
                fontSize: "0.9rem",
              }}
            >
              Word Length:{" "}
              <span style={{ fontFamily: monoFont }}>{charLength}</span>
            </Typography>
            <Slider
              value={charLength}
              onChange={(e, value) => setCharLength(value)}
              min={5}
              max={15}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ color: COLORS.primary }}
            />
          </Grid>

          <Grid item>
            <Typography
              gutterBottom
              style={{
                fontFamily: bodyFont,
                fontWeight: 600,
                color: COLORS.ink,
                fontSize: "0.9rem",
              }}
            >
              Difficulty
            </Typography>
            <Slider
              value={difficulty}
              onChange={(e, value) => setDifficulty(value)}
              min={1}
              max={3}
              step={1}
              marks={DIFFICULTIES}
              valueLabelDisplay="auto"
              sx={{ color: COLORS.primary }}
            />
          </Grid>

          <Grid item>
            <FormControl fullWidth size="small">
              <InputLabel id="language-label">Language</InputLabel>
              <Select
                labelId="language-label"
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.name} value={lang.name}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <Button
              onClick={startGame}
              disabled={playerName.trim() === ""}
              style={primaryButtonStyle}
            >
              Start Game
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }

  // ----- LOADING -----
  // shown when fetching the word from api
  if (mode === "loading") {
    return (
      <div style={pageWrapperStyle}>
        <Grid
          container
          direction="column"
          alignItems="center"
          style={{ paddingTop: 120 }}
        >
          <Typography
            style={{
              fontFamily: monoFont,
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: COLORS.muted,
            }}
          >
            Loading word…
          </Typography>
        </Grid>
      </div>
    );
  }

  // ----- GAME OVER -----
  // when wrongCount reaches maxWrong
  if (mode === "gameover") {
    return (
      <div style={pageWrapperStyle}>
        <Grid container direction="column" spacing={2} style={cardStyle}>
          <Grid item>
            <span style={eyebrowStyle}>Game Over</span>
            <Typography
              component="div"
              style={{
                ...titleBlockStyle,
                fontSize: "1.7rem",
                color: COLORS.rust,
              }}
            >
              Nice game, {playerName}
            </Typography>
            <Typography
              style={{
                fontFamily: bodyFont,
                color: COLORS.muted,
                marginTop: 6,
                fontSize: "0.95rem",
              }}
            >
              Thanks for playing :)
            </Typography>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginTop: 20,
                paddingTop: 16,
                borderTop: `1px solid ${COLORS.border}`,
              }}
            >
              <span style={statLabelStyle}>Score</span>
              <span style={{ ...statValueStyle, fontSize: "1.4rem" }}>
                {score}
              </span>
            </div>
          </Grid>
          <Grid item style={{ display: "flex", justifyContent: "center" }}>
            <img
              src="https://media1.tenor.com/m/IdQJwgoeSNwAAAAd/pokemon-what.gif"
              alt="confused Psyduck"
              style={{
                maxHeight: 150,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
              }}
            />
          </Grid>
          <Grid item>
            <span style={eyebrowStyle}>Words</span>
            {wordHistory.map((entry, i) => (
              <Typography
                key={i}
                style={{
                  fontFamily: monoFont,
                  fontSize: "0.9rem",
                  color: entry.solved ? COLORS.ink : COLORS.muted,
                  padding: "3px 0",
                }}
              >
                <span
                  style={{ color: entry.solved ? COLORS.gold : COLORS.rust }}
                >
                  {entry.solved ? "✓" : "✗"}
                </span>{" "}
                {entry.word}
                {entry.solved && ` (+${entry.points})`}
              </Typography>
            ))}
          </Grid>
          <Grid item>
            <Button onClick={reset} style={primaryButtonStyle}>
              Play Again
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }

  // ----- PLAYING -----
  const incorrectLetters = guessedLetters.filter((l) => !word.includes(l));

  return (
    <div style={pageWrapperStyle}>
      {showCelebration && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(28,35,51,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <img
            src={celebrationGif}
            alt="celebration"
            style={{ maxHeight: "60%", borderRadius: 12 }}
          />
        </div>
      )}

      <Grid
        container
        direction="column"
        alignItems="center"
        style={{
          padding: 24,
          minHeight: "100vh",
          justifyContent: "center",
        }}
      >
        <Typography component="div" style={titleBlockStyle}>
          HangCat
        </Typography>
        <div style={titleRuleStyle} />

        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 18,
            marginBottom: 8,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={statLabelStyle}>Score</div>
            <div style={statValueStyle}>{score}</div>
          </div>
          <div style={{ width: 1, backgroundColor: COLORS.border }} />
          <div style={{ textAlign: "center" }}>
            <div style={statLabelStyle}>Missed</div>
            <div
              style={{
                ...statValueStyle,
                color: wrongCount > 0 ? COLORS.rust : COLORS.ink,
              }}
            >
              {wrongCount} / {maxWrong}
            </div>
          </div>
        </div>

        {CAT_STAGES[wrongCount] && (
          <div
            style={{
              width: 280,
              height: 320,
              boxSizing: "border-box",
              padding: 8,
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              boxShadow:
                "0 1px 2px rgba(28,35,51,0.04), 0 8px 20px rgba(28,35,51,0.05)",
              margin: "8px auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={CAT_STAGES[wrongCount]}
              alt={`${wrongCount} wrong guesses`}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            width: "100%",
            maxWidth: 460,
            margin: "8px 0",
          }}
        >
          {word.split("").map((ch, i) => {
            const revealed = guessedLetters.includes(ch);
            return (
              <div
                key={i}
                style={{
                  width: 42,
                  height: 42,
                  border: `1.5px solid ${revealed ? COLORS.gold : COLORS.border}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textTransform: "uppercase",
                  fontSize: 19,
                  fontFamily: monoFont,
                  fontWeight: 700,
                  backgroundColor: revealed ? COLORS.goldSoft : COLORS.card,
                  color: COLORS.ink,
                  transition:
                    "background-color 0.2s ease, border-color 0.2s ease",
                }}
              >
                {revealed ? ch : ""}
              </div>
            );
          })}
        </div>

        <Typography
          style={{
            fontFamily: monoFont,
            fontSize: "0.85rem",
            color: COLORS.muted,
            marginTop: 10,
            marginBottom: 20,
            textAlign: "center",
            letterSpacing: "0.02em",
          }}
        >
          Incorrect guesses: {incorrectLetters.join(", ") || "none yet"}
        </Typography>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
            width: "100%",
          }}
        >
          {keyboardRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {row.map((letter) => (
                <Button
                  key={letter}
                  variant="contained"
                  disableElevation
                  disabled={guessedLetters.includes(letter) || showCelebration}
                  onClick={() => guessLetter(letter)}
                  style={getKeyStyle(letter)}
                >
                  {letter}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </Grid>
    </div>
  );
}

export default App;
