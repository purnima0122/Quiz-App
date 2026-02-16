import { useEffect, useMemo, useState } from "react";
import QuestionCard from "./components/questioncard";

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("quizToken") || "");
  const [authUser, setAuthUser] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [authMenuMode, setAuthMenuMode] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    }
  }, [token]);

  async function fetchQuestions() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/questions/");
      if (!response.ok) {
        throw new Error("Could not fetch questions.");
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch {
      setError("Failed to load questions from backend.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile(currentToken) {
    try {
      const response = await fetch("/api/profile/", {
        headers: {
          Authorization: `Token ${currentToken}`,
        },
      });

      if (!response.ok) {
        setAuthUser(null);
        return;
      }

      const data = await response.json();
      setAuthUser(data);
    } catch {
      setAuthUser(null);
    }
  }

  async function handleRegister() {
    setAuthMessage("");
    try {
      const response = await fetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthMessage(data.error || "Register failed");
        return;
      }
      setToken(data.token);
      localStorage.setItem("quizToken", data.token);
      setAuthUser(data.user);
      setAuthMessage("Registered and logged in");
      setAuthMenuMode("");
    } catch {
      setAuthMessage("Register failed");
    }
  }

  async function handleLogin() {
    setAuthMessage("");
    try {
      const response = await fetch("/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthMessage(data.error || "Login failed");
        return;
      }
      setToken(data.token);
      localStorage.setItem("quizToken", data.token);
      setAuthUser(data.user);
      setAuthMessage("Logged in");
      setAuthMenuMode("");
    } catch {
      setAuthMessage("Login failed");
    }
  }

  async function handleLogout() {
    if (!token) return;
    try {
      await fetch("/api/logout/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
      });
    } catch {
      // Ignore network errors and clear local auth anyway.
    }
    localStorage.removeItem("quizToken");
    setToken("");
    setAuthUser(null);
    setAuthMessage("Logged out");
    setAuthMenuMode("");
  }

  function openRegisterMenu() {
    setAuthMessage("");
    setAuthMenuMode((prev) => (prev === "register" ? "" : "register"));
  }

  function openLoginMenu() {
    setAuthMessage("");
    setAuthMenuMode((prev) => (prev === "login" ? "" : "login"));
  }

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const showAnswer = selectedOption !== "";
  const completedQuestions = finished ? totalQuestions : currentQuestionIndex;
  const completedPercent = started && totalQuestions > 0
    ? Math.round((completedQuestions / totalQuestions) * 100)
    : 0;
  const headerProgressPercent = completedPercent;

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: index,
        left: `${(index * 97) % 100}%`,
        delay: `${(index % 8) * 0.2}s`,
        duration: `${3 + (index % 5) * 0.35}s`,
      })),
    []
  );

  function startQuiz() {
    if (totalQuestions === 0) return;
    setStarted(true);
  }

  function handleAnswer(option) {
    if (showAnswer) return;

    setSelectedOption(option);

    if (option === currentQuestion.answer) {
      setScore((prevScore) => prevScore + 1);
    }
  }

  function goToNextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedOption("");
      return;
    }

    setFinished(true);
  }

  function restartQuiz() {
    setCurrentQuestionIndex(0);
    setSelectedOption("");
    setScore(0);
    setFinished(false);
    setStarted(totalQuestions > 0);
  }

  return (
    <main className="container">
      <h1 className="app-title">Quiz Game</h1>
      <section className="auth-bar">
        <div className="auth-top-row">
          <div className="auth-left-actions">
            <button type="button" onClick={openRegisterMenu}>
              Register
            </button>
            <button type="button" onClick={openLoginMenu}>
              Login
            </button>
          </div>
          <div className="auth-right-actions">
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {authMenuMode && (
          <div className="auth-dropdown">
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            {authMenuMode === "register" && (
              <input
                type="email"
                placeholder="email (optional)"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={authMenuMode === "register" ? handleRegister : handleLogin}
            >
              {authMenuMode === "register" ? "Submit Register" : "Submit Login"}
            </button>
          </div>
        )}

        <p className="auth-status">
          {authUser ? `Logged in as ${authUser.username}` : "Guest mode"}
          {authMessage ? ` | ${authMessage}` : ""}
        </p>
      </section>

      <section className="head-container">
        <div className="details">
          <h2>Easy practice quiz for beginners</h2>
          <div id="progressbar">
            <div id="progress" style={{ width: `${headerProgressPercent}%` }} />
          </div>
        </div>
        <div id="numbers">{completedPercent}%</div>
      </section>

      {loading && (
        <section className="quiz-panel">
          <p>Loading questions...</p>
        </section>
      )}

      {!loading && error && (
        <section className="quiz-panel">
          <p>{error}</p>
          <button type="button" onClick={fetchQuestions}>
            Retry
          </button>
        </section>
      )}

      {!loading && !error && totalQuestions === 0 && (
        <section className="quiz-panel">
          <h2>No Questions Yet</h2>
          <p>Add questions from Django admin to start the quiz.</p>
        </section>
      )}

      {!loading && !error && totalQuestions > 0 && !started && (
        <section className="quiz-panel">
          <h2>Welcome</h2>
          <p>Click start and answer each question. Score goes up for each correct answer.</p>
          <button type="button" onClick={startQuiz}>
            Start Quiz
          </button>
        </section>
      )}

      {!loading && !error && totalQuestions > 0 && started && !finished && (
        <section className="quiz-panel">
          <p className="question-count">
            Question {currentQuestionIndex + 1} of {totalQuestions} | Score: {score}/{totalQuestions}
          </p>
          <QuestionCard
            data={currentQuestion}
            onAnswer={handleAnswer}
            selected={selectedOption}
            showAnswer={showAnswer}
          />
          {showAnswer && <p className="answer-text">Correct answer: {currentQuestion.answer}</p>}
          {showAnswer && (
            <button type="button" className="next-btn" onClick={goToNextQuestion}>
              {currentQuestionIndex === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
            </button>
          )}
        </section>
      )}

      {!loading && !error && totalQuestions > 0 && finished && (
        <section className="quiz-panel finished-panel">
          <div className="confetti" aria-hidden="true">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="confetti-piece"
                style={{
                  left: piece.left,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                }}
              />
            ))}
          </div>
          <h2>Quiz Finished</h2>
          <p>
            Final score: {score} / {totalQuestions}
          </p>
          <button type="button" onClick={restartQuiz}>
            Restart Quiz
          </button>
        </section>
      )}
    </main>
  );
}
