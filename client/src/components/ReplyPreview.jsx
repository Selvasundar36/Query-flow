function ReplyPreview({ replyTo, onCancel }) {
  if (!replyTo) return null;

  return (
    <div className="reply-preview">
      <div className="reply-text">
        Replying to <b>{replyTo.user}</b>:  
        <span> {replyTo.text}</span>
      </div>
      <button onClick={onCancel}>✖</button>
    </div>
  );
}

export default ReplyPreview;
