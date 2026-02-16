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

  useEffect(() => {
    fetchQuestions();
  }, []);

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
