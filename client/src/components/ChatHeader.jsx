function ChatHeader({
  room,
  username,
  showQuestions,
  unreadQuestionCount,
  onBack,
  onToggle,
}) {
  return (
    <div className="chat-header">
      <button onClick={onBack}>⬅️</button>
    
      <h4 className="ch-name">{room} | {username}</h4>

      <button
        className={`question-toggle ${showQuestions ? "active" : ""}`}
        onClick={onToggle}
      >
        ?
        {unreadQuestionCount > 0 && (
          <span className="question-count">
            {unreadQuestionCount}
          </span>
        )}
      </button>

  
      

    </div>
  );
}

export default ChatHeader;
