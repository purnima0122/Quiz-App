function QuestionCard({ data, onAnswer, showAnswer, selected }) {
  const { question, options, answer } = data;

  function getOptionClass(option) {
    if (!showAnswer) return "option-button";
    if (option === answer) return "option-button correct";
    if (option === selected) return "option-button wrong";
    return "option-button";
  }

  return (
    <section className="question-card">
      <h2 className="question-text">{question}</h2>
      <div className="options-list">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={getOptionClass(option)}
            onClick={() => onAnswer(option)}
            disabled={showAnswer}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuestionCard;
