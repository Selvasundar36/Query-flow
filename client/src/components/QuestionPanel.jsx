export default function QuestionPanel({
  questions,
  onSelectQuestion,
  onClose,
  onCancelSelection   // ✅ NEW PROP
}) {
  return (
    <div className="question-panel">
      <div className="question-panel-header">
        <h4>Questions ({questions.length})</h4>

        {/* ✅ Cancel Selection Button */}
        <button className="cancel-btn" onClick={onCancelSelection}>
          Cancel Selection
        </button>

        <img
          src="https://cdn3.emoji.gg/emojis/1326_cross.png"
          onClick={onClose}
        />
      </div>

      <div className="questions">
        {questions.length === 0 && (
          <p className="empty">No questions yet</p>
        )}

        {questions.map((q) => (
          <div
            key={q.questionId}
            className="question-item"
            onClick={() => onSelectQuestion(q)}
          >
            <div className="q-user">👤 {q.user}</div>
            <div className="q-text">{q.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}