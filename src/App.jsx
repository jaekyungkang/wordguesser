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

const baseFont = "'Nunito', 'Helvetica Neue', Arial, sans-serif";

const COLORS = {
  blue: "#1D4ED8",
  yellow: "#FBBF24",
  orange: "#F97316",
  black: "#111111",
  white: "#FFFFFF",
};

// picks white text for blue/orange backgrounds, black text for yellow —
// so every colored surface automatically gets a readable text color
const bannerStyle = (bg, extra = {}) => ({
  display: "inline-block",
  backgroundColor: bg,
  color: bg === COLORS.yellow ? COLORS.black : COLORS.white,
  padding: "6px 20px",
  borderRadius: 8,
  fontFamily: baseFont,
  fontWeight: 800,
  ...extra,
});

const cardStyle = {
  padding: 32,
  maxWidth: 460,
  margin: "48px auto",
  backgroundColor: COLORS.white,
  border: `4px solid ${COLORS.blue}`,
  borderRadius: 16,
  fontFamily: baseFont,
  color: COLORS.black,
};

const primaryButtonStyle = {
  backgroundColor: COLORS.blue,
  color: COLORS.white,
  fontFamily: baseFont,
  fontSize: "1.1rem",
  fontWeight: 700,
  borderRadius: 8,
  border: `2px solid ${COLORS.blue}`,
  padding: "8px 24px",
  textTransform: "none",
};

function App() {
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
    null, // this is when theyre are 0 wrong guesses
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
    let color = COLORS.black;
    if (correct) {
      bg = COLORS.yellow;
      color = COLORS.black;
    }
    if (wrong) {
      bg = COLORS.orange;
      color = COLORS.white;
    }

    return {
      fontFamily: baseFont,
      fontWeight: 700,
      minWidth: 56,
      height: 58,
      borderRadius: 8,
      border: `3px solid ${COLORS.blue}`,
      backgroundColor: bg,
      color,
      fontSize: "1.2rem",
      textTransform: "uppercase",
    };
  };

  // SETUP SCREEN!
  // gets name, word length, difficulty, and language
  if (mode === "pre-stage") {
    return (
      <Grid container direction="column" spacing={3} style={cardStyle}>
        <Grid item>
          <Typography style={bannerStyle(COLORS.blue, { fontSize: "2rem" })}>
            HangCat
          </Typography>
          <Typography
            variant="body1"
            style={{ fontFamily: baseFont, lineHeight: 1.5, marginTop: 12 }}
          >
            Guess the random word! Pick one letter at a time, and if it's in the
            word, it'll be shown in the correct position. If it's not, you'll be
            using one of your {maxWrong} guesses. You'll be given points for
            every word you guess correctly. The game ends once you've drawn the
            cat! Good luck!
          </Typography>
        </Grid>

        {/* player name required*/}
        <Grid item>
          <TextField
            label="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            fullWidth
            required
          />
        </Grid>

        <Grid item>
          <Typography
            gutterBottom
            style={{ fontFamily: baseFont, fontWeight: 700 }}
          >
            Word Length: {charLength}
          </Typography>
          <Slider
            value={charLength}
            onChange={(e, value) => setCharLength(value)}
            min={5}
            max={15}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Grid>

        <Grid item>
          <Typography
            gutterBottom
            style={{ fontFamily: baseFont, fontWeight: 700 }}
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
          />
        </Grid>

        <Grid item>
          <FormControl fullWidth>
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
    );
  }

  // ----- LOADING -----
  // shown when fetching the word from api
  if (mode === "loading") {
    return (
      <Grid
        container
        direction="column"
        alignItems="center"
        style={{ marginTop: 100 }}
      >
        <Typography
          style={{
            fontFamily: baseFont,
            fontSize: "1.5rem",
            color: COLORS.white,
          }}
        >
          Loading word...
        </Typography>
      </Grid>
    );
  }

  // ----- GAME OVER -----
  // when wrongCount reaches maxWrong
  if (mode === "gameover") {
    return (
      <Grid container direction="column" spacing={2} style={cardStyle}>
        <Grid item>
          <Typography
            style={bannerStyle(COLORS.orange, { fontSize: "1.8rem" })}
          >
            Game Over
          </Typography>
          <Typography
            style={{
              fontFamily: baseFont,
              fontWeight: 700,
              marginTop: 12,
              color: COLORS.black,
            }}
          >
            Nice game, {playerName}! Thanks for playing :)
          </Typography>
          <Typography
            style={bannerStyle(COLORS.yellow, {
              fontSize: "1.4rem",
              marginTop: 8,
            })}
          >
            Score: {score}
          </Typography>
        </Grid>
        <Grid item style={{ display: "flex", justifyContent: "center" }}>
          <img
            src="https://media1.tenor.com/m/IdQJwgoeSNwAAAAd/pokemon-what.gif"
            alt="confused Psyduck"
            style={{
              maxHeight: 160,
              borderRadius: 12,
              border: `3px solid ${COLORS.blue}`,
            }}
          />
        </Grid>
        <Grid item>
          <Typography
            style={{
              fontFamily: baseFont,
              fontWeight: 700,
              color: COLORS.black,
            }}
          >
            Words:
          </Typography>
          {wordHistory.map((entry, i) => (
            <Typography
              key={i}
              style={{ fontFamily: baseFont, color: COLORS.black }}
            >
              {entry.solved ? "✓" : "✗"} {entry.word}
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
    );
  }

  // ----- PLAYING -----
  const incorrectLetters = guessedLetters.filter((l) => !word.includes(l));

  return (
    <>
      {showCelebration && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <img
            src={celebrationGif}
            alt="celebration"
            style={{ maxHeight: "60%" }}
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
        <Typography style={bannerStyle(COLORS.blue, { fontSize: "2rem" })}>
          HangCat
        </Typography>

        <Typography
          style={bannerStyle(COLORS.yellow, { marginTop: 12, marginBottom: 8 })}
        >
          Score: {score}
        </Typography>

        {CAT_STAGES[wrongCount] && (
          <div
            style={{
              width: 300,
              height: 360,
              boxSizing: "border-box",
              padding: 8,
              backgroundColor: COLORS.white,
              border: `3px solid ${COLORS.blue}`,
              borderRadius: 12,
              margin: "8px auto 16px",
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
            margin: "8px 0",
          }}
        >
          {word.split("").map((ch, i) => {
            const revealed = guessedLetters.includes(ch);
            return (
              <div
                key={i}
                style={{
                  width: 44,
                  height: 44,
                  border: `3px solid ${COLORS.blue}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textTransform: "uppercase",
                  fontSize: 20,
                  fontFamily: baseFont,
                  fontWeight: 800,
                  backgroundColor: revealed ? COLORS.yellow : COLORS.white,
                  color: COLORS.black,
                  animation: revealed ? "pop-in 0.3s ease" : "none",
                }}
              >
                {revealed ? ch : ""}
              </div>
            );
          })}
        </div>

        <Typography
          style={{ fontFamily: baseFont, fontWeight: 700, color: COLORS.white }}
        >
          MISSED: {wrongCount} / {maxWrong}
        </Typography>
        <Typography
          style={{
            fontFamily: baseFont,
            color: COLORS.white,
            marginBottom: 12,
          }}
        >
          INCORRECT GUESSES: {incorrectLetters.join(", ") || "none yet"}
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
                gap: 10,
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
    </>
  );
}

export default App;
