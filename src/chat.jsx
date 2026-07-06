import { useState, useCallback } from "react";

// The API supports difficulty natively as an integer 1-5, so we send it
// straight through as a query param instead of deriving it locally.
const DIFFICULTIES = [
  { value: 1, label: "1 - Easiest" },
  { value: 2, label: "2 - Easy" },
  { value: 3, label: "3 - Medium" },
  { value: 4, label: "4 - Hard" },
  { value: 5, label: "5 - Hardest" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "it", label: "Italian" },
];

const MAX_WRONG_GUESSES = 6;

export default function App() {
  // ---- Settings state: everything the user picks before playing ----
  const [difficulty, setDifficulty] = useState(1);
  const [length, setLength] = useState(""); // "" = any length at this difficulty
  const [language, setLanguage] = useState("en");

  // ---- Game state: everything that changes as they play ----
  const [word, setWord] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | loading | playing | won | lost | error

  // useCallback so this stable function reference can be reused (e.g. passed
  // to a "Play again" button) without re-creating it every render.
  const startGame = useCallback(async () => {
    setStatus("loading");
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setWord(null);

    // Build the query string dynamically from current settings state.
    // "length" is optional here — omit it to let difficulty alone decide.
    const params = new URLSearchParams({
      number: "1",
      difficulty: String(difficulty),
      lang: language,
    });
    if (length) params.set("length", length);

    try {
      const res = await fetch(
        `https://random-word-api.herokuapp.com/word?${params.toString()}`,
      );
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json(); // e.g. ["apple"]
      const fetchedWord = data[0]?.toLowerCase();

      if (!fetchedWord) throw new Error("No word returned");

      setWord(fetchedWord);
      setStatus("playing");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [difficulty, length, language]);

  const handleGuess = (letter) => {
    if (status !== "playing" || guessedLetters.has(letter)) return;

    const nextGuessed = new Set(guessedLetters);
    nextGuessed.add(letter);
    setGuessedLetters(nextGuessed);

    if (!word.includes(letter)) {
      const nextWrong = wrongGuesses + 1;
      setWrongGuesses(nextWrong);
      if (nextWrong >= MAX_WRONG_GUESSES) setStatus("lost");
      return;
    }

    // Check for a win: every letter in the word has been guessed.
    const isWon = [...word].every((ch) => nextGuessed.has(ch));
    if (isWon) setStatus("won");
  };

  const displayWord = word
    ? [...word].map((ch) => (guessedLetters.has(ch) ? ch : "_")).join(" ")
    : "";

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Hangman</h1>

        {/* ---- Settings panel: disabled while a round is in progress ---- */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Difficulty
            </label>
            <select
              className="w-full rounded-lg bg-slate-700 p-2"
              value={difficulty}
              disabled={status === "playing" || status === "loading"}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Exact length
            </label>
            <select
              className="w-full rounded-lg bg-slate-700 p-2"
              value={length}
              disabled={status === "playing" || status === "loading"}
              onChange={(e) => setLength(e.target.value)}
            >
              <option value="">Any length</option>
              {Array.from({ length: 9 }, (_, i) => i + 3).map((n) => (
                <option key={n} value={n}>
                  {n} letters
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Language
            </label>
            <select
              className="w-full rounded-lg bg-slate-700 p-2"
              value={language}
              disabled={status === "playing" || status === "loading"}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="w-full mb-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors p-3 font-semibold disabled:opacity-50"
          onClick={startGame}
          disabled={status === "loading"}
        >
          {status === "loading"
            ? "Fetching word..."
            : status === "playing"
              ? "Restart"
              : "Start game"}
        </button>

        {status === "error" && (
          <p className="text-red-400 text-center mb-4">
            Couldn't fetch a word. Try again.
          </p>
        )}

        {word && (
          <>
            <p className="text-center text-4xl tracking-widest mb-4 font-mono">
              {displayWord}
            </p>
            <p className="text-center text-slate-400 mb-6">
              Wrong guesses: {wrongGuesses} / {MAX_WRONG_GUESSES}
            </p>

            {status === "won" && (
              <p className="text-center text-emerald-400 text-xl mb-4">
                You won! The word was "{word}".
              </p>
            )}
            {status === "lost" && (
              <p className="text-center text-red-400 text-xl mb-4">
                Out of guesses! The word was "{word}".
              </p>
            )}

            <div className="grid grid-cols-7 gap-2">
              {alphabet.map((letter) => {
                const guessed = guessedLetters.has(letter);
                const correct = guessed && word.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => handleGuess(letter)}
                    disabled={guessed || status !== "playing"}
                    className={`rounded-lg p-2 font-semibold uppercase transition-colors ${
                      guessed
                        ? correct
                          ? "bg-emerald-700 text-emerald-200"
                          : "bg-red-900 text-red-300"
                        : "bg-slate-700 hover:bg-slate-600"
                    } disabled:cursor-not-allowed`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
