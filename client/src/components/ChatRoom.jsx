import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
// import { PRIME_USERS } from "../constants/primeUsers";

import "./css/ChatRoom.css";
import "./css/Login.css";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import QuestionPanel from "./QuestionPanel";
import ReplyPreview from "./ReplyPreview";

function ChatRoom({ room, onNewMessage,loggedUser }) {
  const [username, setUsername] = useState(
  loggedUser?.name || loggedUser?.displayName || ""
);

const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [highlightMsgId, setHighlightMsgId] = useState(null);

  const [file, setFile] = useState(null);

  /* ================= QUESTION STATES ================= */
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [unreadQuestionCount, setUnreadQuestionCount] = useState(0);

  const messageRefs = useRef({});
  const bottomRef = useRef(null);

  const [isPrivate, setIsPrivate] = useState(false);
  const [privateTo, setPrivateTo] = useState("");
 const [primeUsers, setPrimeUsers] = useState([]);

  // const isPrimeUser = PRIME_USERS[room]?.includes(username);

  /* ================= JOIN ================= */
  
  const goBack = () => {
    socket.emit("leave_room", { room, user: username });
    setJoined(false);
    setMessages([]);
  };
  /*questiin panel on select question handler moved to ChatRoom to pass refs and active question state*/

const cancelSelection = () => {
  setActiveQuestion(null);   

  // ✅ scroll to bottom
  bottomRef.current?.scrollIntoView({
    behavior: "smooth",
  });
};

  /* ================= FILE UPLOAD ================= */
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat_upload");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dhm7xorjf/auto/upload",
      { method: "POST", body: formData }
    );

    const data = await res.json();

    return {
      fileUrl: data.secure_url,
      fileType: file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : "audio",
    };
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!message.trim() && !file) return;

    if (editingMsg) {
      socket.emit("editMessage", {
        messageId: editingMsg._id,
        newText: message,
      });
      setMessage("");
      setEditingMsg(null);
      return;
    }

    let fileData = {};
    if (file) fileData = await uploadFile(file);

    socket.emit("send_message", {
      room,
      user: username,
      text: message,
      replyTo,
      type: isPrivate ? "private" : "public",
      privateTo: isPrivate ? privateTo : null,
      ...fileData,
    });

    setMessage("");
    setFile(null);
    setReplyTo(null);
    setActiveQuestion(null);
    if (!username) {
  alert("Username not loaded yet");
  return;
}
  };

  /* ================= AUDIO ================= */
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) =>
      audioChunksRef.current.push(e.data);

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const audioFile = new File([blob], "voice.webm", {
        type: "audio/webm",
      });

      const fileData = await uploadFile(audioFile);

      socket.emit("send_message", {
        room,
        user: username,
        text: "",
        replyTo,
        type: isPrivate ? "private" : "public",
        privateTo: isPrivate ? privateTo : null,
        ...fileData,
      });
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };



useEffect(() => {
  if (!loggedUser) return;

  const googleName =
    loggedUser.username ||
    loggedUser.displayName ||
    loggedUser.name ||
    "";

  setUsername(googleName);

}, [loggedUser]);

useEffect(() => {
  if (!room || !username) return;

  socket.emit("join_room", {
    room,
    user: username,
  });

}, [room, username]);

  /* ================= SOCKET LISTENERS ================= */
  useEffect(() => {
  socket.on("join_success", ({ messages, questions, primeUsers }) => {
  setMessages(messages || []);
  setQuestions(questions || []);
  setPrimeUsers(primeUsers || []); 
  setJoined(true);
});

   socket.on("receive_message", (msg) => {
  setMessages((prev) => {
    if (prev.some((m) => m._id === msg._id)) return prev;
    return [...prev, msg];
  });

 if (msg.user !== loggedUser?.name) {
  onNewMessage?.();
}
});

    /* ===== QUESTION RECEIVER ===== */
    socket.on("new_question", (question) => {
      setQuestions((prev) => [...prev, question]);
      setUnreadQuestionCount((prev) => prev + 1);
    });
    socket.on("question_deleted", (messageId) => {
  setQuestions((prev) =>
    prev.filter((q) => q.questionId !== messageId)
  );
});

 
    socket.on("messageEdited", (msg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msg._id
            ? { ...m, text: msg.text, edited: true }
            : m
        )
      );

      setHighlightMsgId(msg._id);
      setTimeout(() => setHighlightMsgId(null), 2000);
    });

    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.filter((m) => m._id !== messageId)
      );
    });

    socket.on("like_updated", ({ messageId, likedBy }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, likedBy } : m
        )
      );
    });

    return () => {
      socket.off("join_success");
      socket.off("receive_message");
      socket.off("new_question");
      socket.off("question_deleted");
      socket.off("messageEdited");
      socket.off("message_deleted");
      socket.off("like_updated");
    };
  }, [room, ]);
  useEffect(() => {
  setMessages([]);
  setQuestions([]);
  setJoined(false);
}, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (
    <div className="chat-layout">
      <div className="chat-container">

        <ChatHeader
          room={room}
          username={username}
          showQuestions={showQuestions}
          unreadQuestionCount={unreadQuestionCount}
          onBack={goBack}
          onToggle={() => {
            setShowQuestions(!showQuestions);
            setUnreadQuestionCount(0);
          }}
        />

         {/* ===== QUESTION PANEL =====
        {showQuestions && (
          <QuestionPanel
            questions={questions}
            activeQuestion={activeQuestion}
            setActiveQuestion={setActiveQuestion}
            onClose={() => setShowQuestions(false)}
          />
        )} */}
        {/* <button
          className="pp-flag"
          onClick={() => setIsPrivate((p) => !p)}
        >
          {isPrivate ? "Private" : "Public"}
        </button> */}

        <MessageList
          messages={messages}
          username={username}
          room={room}
          messageRefs={messageRefs}
          primeUsers={primeUsers} 
          activeQuestion={activeQuestion}
          highlightMsgId={highlightMsgId}
          onReply={setReplyTo}
          onEdit={(msg) => {
            setEditingMsg(msg);
            setMessage(msg.text);
          }}
          onDelete={(id) =>
            socket.emit("delete_message", {
              messageId: id,
              username,
              room,
            })
          }
          onLike={(id) =>
            socket.emit("like_message", {
              messageId: id,
              user: username,
            })
          }
          bottomRef={bottomRef}
        />

        <ReplyPreview
          replyTo={replyTo}
          onCancel={() => setReplyTo(null)}
        />

        <ChatInput
          message={message}
          setMessage={setMessage}
          setFile={setFile}
          onSend={sendMessage}
          recording={recording}
          onStartRecord={startRecording}
          onStopRecord={stopRecording}
          editing={!!editingMsg}
           cancelEdit={() => {
    setEditingMsg(null);   // ✅ clear edit mode
    setMessage("");        // ✅ clear input
  }}
        />

      </div>
         {showQuestions && (
      <QuestionPanel
  questions={questions}
  room={room}
  activeQuestion={activeQuestion}   // ✅ ADD
  onSelectQuestion={(q) => {
    setActiveQuestion(q);

    messageRefs.current[q.questionId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }}
  onCancelSelection={() => {
    setActiveQuestion(null);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }}
  onClose={() => setShowQuestions(false)}
/>
      )}
    </div>
  );
}

export default ChatRoom;
