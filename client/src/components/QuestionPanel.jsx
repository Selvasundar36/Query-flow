export default function QuestionPanel({
  questions,
  onSelectQuestion,
  onClose,
  activeQuestion,
  onCancelSelection,
}) {
  return (
    <div className="question-panel">
      <div className="question-panel-header">
        <h4>Questions ({questions.length})</h4>
        <img
          src="https://cdn3.emoji.gg/emojis/1326_cross.png"
          onClick={onClose}
        />
      </div>

      <div className="questions">
        {questions.length === 0 && (
          <p className="empty">No questions yet</p>
        )}

        {questions.map((q) => {
          const isActive = activeQuestion?.questionId === q.questionId;

          return (
            <div
              key={q.questionId}
              className={`question-item ${isActive ? "active-q" : ""}`}
              onClick={() => onSelectQuestion(q)}
            >
              <div className="q-user">👤 {q.user}</div>
              <div className="q-text">{q.text}</div>

              {/* ✅ SHOW CANCEL ONLY FOR SELECTED */}
              {isActive && (
                <button
                  className="cancel-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ prevent re-click
                    onCancelSelection();
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}