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

  const keyboardRows = KEYBOARD_LAYOUTS[language] || KEYBOARD_LAYOUTS.en;
  const maxWrong = 8;

  const searchRandomWord = () => {
    setMode("loading");
    const pool = DIFFICULTY_POOLS[difficulty];
    const apiDiff = pool[Math.floor(Math.random() * pool.length)];

    fetch(
      `https://random-word-api.herokuapp.com/word?length=${charLength}&diff=${apiDiff}&lang=${language}`,
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const newWord = data[0].toLowerCase();

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

  const startGame = () => {
    setScore(0);
    setWrongCount(0);
    setWordHistory([]);
    setUsedWord([]);
    searchRandomWord();
  };

  const guessLetter = (letter) => {
    if (mode !== "playing" || showCelebration) return;

    letter = letter.toLowerCase();
    if (guessedLetters.includes(letter)) return;

    const nextGuessed = [...guessedLetters, letter];
    setGuessedLetters(nextGuessed);

    if (!word.includes(letter)) {
      const nextWrong = wrongCount + 1;
      setWrongCount(nextWrong);

      if (nextWrong >= maxWrong) {
        // out of guesses entirely — record this word as unsolved and end the game
        setWordHistory((prev) => [...prev, { word, solved: false, points: 0 }]);
        setMode("gameover");
      }
    } else {
      const solved = word.split("").every((ch) => nextGuessed.includes(ch));
      if (solved) {
        const points = word.length * difficulty;
        setScore((prev) => prev + points);
        setWordHistory((prev) => [...prev, { word, solved: true, points }]);

        // celebrate!
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

  const reset = () => setMode("pre-stage");

  // ADD DUCK CONFETTI

  // game
  // u            store wrong guess, in state, and condition will draw next
  // import useState - have handleGuess function -> define constant of letter to be the guess
  // if randomword does not include letter, then wrongguess++
  // display word = randomword

  /* returning, playername, points game over button */
  if (mode === "pre-stage") {
    return (
      <Grid
        container
        direction="column"
        spacing={3}
        style={{ padding: 24, maxWidth: 400 }}
      >
        <Grid item>
          <Typography variant="h4">Word Guess</Typography>
          <Typography variant="body1">
            Guess the hidden word one letter at a time. Pick a letter for each
            guess — if it's in the word, it'll be revealed; if not, you'll use
            up one of your {maxWrong} misses. Guess the whole word before you
            run out of misses to win.
          </Typography>
        </Grid>

        <Grid item>
          <Typography gutterBottom>Word Length: {charLength}</Typography>
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
          <Typography gutterBottom>Difficulty</Typography>
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
          <Button variant="contained" onClick={startGame}>
            Start Game
          </Button>
        </Grid>
      </Grid>
    );
  }

  // ----- LOADING -----
  if (mode === "loading") {
    return <Typography variant="h5">Loading word...</Typography>;
  }

  // ----- GAME OVER -----
  if (mode === "gameover") {
    return (
      <Grid
        container
        direction="column"
        spacing={2}
        style={{ padding: 24, maxWidth: 500 }}
      >
        <Grid item>
          <Typography variant="h4">Game Over</Typography>
          <Typography variant="h5">Final Score: {score}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6">Words:</Typography>
          {wordHistory.map((entry, i) => (
            <Typography key={i}>
              {entry.word} —{" "}
              {entry.solved ? `solved (+${entry.points})` : "not solved"}
            </Typography>
          ))}
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={reset}>
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
      <Typography gutterBottom variant="h1">
        Word Guess
      </Typography>

      <Typography variant="h6">Score: {score}</Typography>

      {CAT_STAGES[wrongCount] && (
        <img
          src={CAT_STAGES[wrongCount]}
          alt={`${wrongCount} wrong guesses`}
          style={{ height: 150 }}
        />
      )}

      <Grid container spacing={1} style={{ margin: "16px 0" }}>
        {word.split("").map((ch, i) => (
          <Grid item key={i}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "2px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "uppercase",
                fontSize: 20,
              }}
            >
              {guessedLetters.includes(ch) ? ch : ""}
            </div>
          </Grid>
        ))}
      </Grid>

      <Typography>
        Misses: {wrongCount} / {maxWrong}
      </Typography>
      <Typography>
        Incorrect guesses: {incorrectLetters.join(", ") || "none yet"}
      </Typography>

      <Grid container direction="column" spacing={1} style={{ marginTop: 16 }}>
        {keyboardRows.map((row, rowIndex) => (
          <Grid
            container
            item
            spacing={1}
            key={rowIndex}
            justifyContent="center"
          >
            {row.map((letter) => (
              <Grid item key={letter}>
                <Button
                  variant="outlined"
                  disabled={guessedLetters.includes(letter) || showCelebration}
                  onClick={() => guessLetter(letter)}
                >
                  {letter}
                </Button>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default App;
