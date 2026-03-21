function ChatInput({
  message,
  setMessage,
  setFile,
  onSend,
  recording,
  onStartRecord,
  onStopRecord,
  editing,
  cancelEdit,
}) {
  return (
    <div className="chat-input">
  <input
    type="file"
    onChange={(e) => setFile(e.target.files[0])}
  />

  {!recording ? (
    <button onClick={onStartRecord}>🎤</button>
  ) : (
    <button onClick={onStopRecord}>⏹️</button>
  )}

  <input
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder={editing ? "Editing message..." : "Type message"}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSend();
      }
    }}
  />

  <button onClick={onSend}>
    {editing ? "Update" : "Send"}
  </button>

  {/* ✅ CANCEL BUTTON */}
  {editing && (
    <button
      onClick={cancelEdit}
      style={{
        background: "red",
        color: "white",
        marginLeft: "5px",
        border: "none",
        padding: "5px 10px",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Cancel
    </button>
  )}
</div>
  );
}

export default ChatInput;
