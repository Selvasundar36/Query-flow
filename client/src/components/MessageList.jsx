
import { ADMIN_USERS } from "../constants/Adminuser";
import { useState } from "react";

const DELETE_ICON =
  "https://img.icons8.com/ios-glyphs/30/000000/trash--v1.png";

function MessageList({
  messages,
  username,
  room,
  primeUsers,
  messageRefs,
  activeQuestion,
  highlightMsgId,
  onReply,
  onEdit,
  onDelete,
  onLike,
  bottomRef,
}) {

  //  MUST BE INSIDE COMPONENT
  const [previewMedia, setPreviewMedia] = useState(null);

  return (
    <div className="chat-box">
      {messages.map((msg) => {
        const admins = ADMIN_USERS[room] || [];
        const isAdmin = admins.includes(username);
        const isSender = msg.user === username;
        const userLiked = msg.likedBy?.includes(username);

        // const primeUsers = PRIME_USERS[room] || [];
        
        const isPrimeUser = primeUsers.includes(msg.user);
    //  const isPrimeUser = msg.role === "prime";
        console.log("Message:", msg.user, msg.role);

        return (
          <div
            key={msg._id}
            ref={(el) => (messageRefs.current[msg._id] = el)}
            className={`message ${isSender ? "sent" : "received"}
              ${isPrimeUser ? "prime-user" : ""}
              ${msg.replyTo ? "has-reply" : ""}
              ${activeQuestion?.questionId === msg._id ? "active-question" : ""}
              ${highlightMsgId === msg._id ? "edited-highlight" : ""}`}

            onClick={(e) => {
              if (
                e.target.closest(".delete-btn") ||
                e.target.closest(".edit-btn") ||
                e.target.closest(".like-btn")
              )
                return;

              onReply(msg);
            }}
          >

            {/* ===== SENDER NAME ===== */}
            {!isSender && (
              <div className="sender">
                {msg.user} {isPrimeUser && "💎"}
                
              </div>
            )}

            {/* ===== EDIT BUTTON ===== */}
            {isSender && (
              <div
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(msg);
                }}
              >
                ✏️
              </div>
            )}

            {/* ===== DELETE BUTTON ===== */}
            {(isSender || isAdmin) && (
              <span
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(msg._id);
                }}
              >
                <img src={DELETE_ICON} className="dustbin" />
              </span>
            )}

            {/* ===== REPLY PREVIEW ===== */}
            {msg.replyTo && (
              <div className="reply-inside">
                <div className="reply-user">
                  {msg.replyTo.user}
                </div>
                <div className="reply-message">
                  {msg.replyTo.text}
                </div>
              </div>
            )}
                
            {/* ===== MEDIA ===== */}

            {/* IMAGE */}
            {msg.fileUrl && msg.fileType === "image" && (
              <img
                src={msg.fileUrl}
                alt=""
                className="chat-media"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewMedia({ type: "image", url: msg.fileUrl });
                }}
              />
            )}

            {/* VIDEO */}
            {msg.fileUrl && msg.fileType === "video" && (
              <video
                src={msg.fileUrl}
                controls
                className="chat-media"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewMedia({ type: "video", url: msg.fileUrl });
                }}
              />
            )}

            {/* AUDIO */}
            {msg.fileUrl && msg.fileType === "audio" && (
              <audio
                controls
                src={msg.fileUrl}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewMedia({ type: "audio", url: msg.fileUrl });
                }}
              />
            )}

            {/* ===== TEXT ===== */}
            <div className="text">
              {msg.text}
              {msg.edited && (
                <small className="edited-tag"> (edited)</small>
              )}
            </div>

            {/* ===== TIME ===== */}
            {msg.createdAt && (
              <div className="timestamp">
                {new Date(msg.createdAt).toLocaleString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "short",
                })}
              </div>
            )}

            {/* ===== LIKE BUTTON ===== */}
            {!isSender && (
              <span
                className={`like-btn ${userLiked ? "liked" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(msg._id);
                }}
              >
                👍
              </span>
            )}

            {/* ===== LIKE COUNT ===== */}
            {msg.likedBy?.length > 0 && (
              <div className="like-view">
                👍 {msg.likedBy.length}
              </div>
            )}

            {/* ===== YOU LIKED ===== */}
            {!isSender && userLiked && (
              <small className="you-liked">You liked</small>
            )}
          </div>
        );
      })}

      {/* ===== PREVIEW MODAL ===== */}
      {previewMedia && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setPreviewMedia(null)}
        >
          {previewMedia.type === "image" && (
            <img
              src={previewMedia.url}
              alt=""
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: "10px",
              }}
            />
          )}

          {previewMedia.type === "video" && (
            <video
              src={previewMedia.url}
              controls
              autoPlay
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: "10px",
              }}
            />
          )}

          {previewMedia.type === "audio" && (
            <audio controls autoPlay src={previewMedia.url} />
          )}
        </div>
      )}

      <div ref={bottomRef}></div>
    </div>
  );
}

export default MessageList;
