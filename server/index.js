const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
require("./cron/primeReport");
const cors = require("cors");

const connectDB = require("./db");
connectDB();

const Message = require("./models/Message");
const Question = require("./models/Question");
const isQuestion = require("./utils/QuestionDetect");
// const { PRIME_USERS } = require("../client/src/constants/primeUsers");
// const { ADMIN_USERS } =require("../client/src/constants/Adminuser");
const PrimeUser = require("./models/PrimeUser");

const Room = require("./models/Room");
const User = require("./models/User");

const app = express();


/* ✅ CORS for REST APIs */
app.use(cors({
 origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true,
}));

/* ✅ JSON body parser */
app.use(express.json());
const profileRoutes = require("./routes/profile");
app.use("/api/profile", profileRoutes);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {origin: "*" },
});

app.use("/api/auth", require("./routes/auth"));



// room -> { username: socketId }
const activeUsers = {};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // ================= JOIN ROOM =================
 socket.on("join_room", async ({ room, user }) => {
  if (!activeUsers[room]) activeUsers[room] = {};
  activeUsers[room][user] = socket.id;
  socket.join(room);

  //  Ensure room exists
  let roomData = await Room.findOne({ name: room });

  if (!roomData) {
    roomData = await Room.create({
      name: room,
      primeUsers: [],
    });
  }

  //  Decide role
  let role = "user";

  if (user === "admin@gmail.com") {
    role = "admin";
  } else if (roomData.primeUsers.includes(user)) {
    role = "prime";
  }

  await User.findOneAndUpdate(
    { username: user, room },
    { role },
    { upsert: true, new: true }
  );

  const messages = await Message.find({ room }).sort({ createdAt: 1 });
  const questions = await Question.find({ room }).sort({ createdAt: -1 });
  const isAdmin = user === "Admin";
  socket.emit("join_success", {messages,
      questions,primeUsers: roomData?.primeUsers || [],role: isAdmin ? "admin" : "user" }
  );

  console.log(`${user} joined ${room} as ${role}`);
});
///send message
socket.on("send_message", async (data) => {
  try {

    if (!data.user) {
      console.log("User missing in message");
      return;
    }

    const userData = await User.findOne({
      username: data.user,
      room: data.room,
    });

    const msg = await Message.create({
      room: data.room,
      user: data.user,
      role: userData?.role || "user",
      text: data.text,
      replyTo: data.replyTo || null,
      fileUrl: data.fileUrl || null,
      fileType: data.fileType || null,
      type: data.type || "public",
      role: isAdmin ? "admin" : "user",
    });

    // ================= PRIVATE =================
//   if (data.type === "private") {
//   const roomData = await Room.findOne({ name: data.room });
//   const primeList = roomData?.primeUsers || [];

//   const allowedUsers = [data.user, ...primeList];

//   allowedUsers.forEach((u) => {
//     const socketId = activeUsers[data.room]?.[u];
//     if (socketId) {
//       io.to(socketId).emit("receive_message", msg);
//     }
//   });

// } else {
  io.to(data.room).emit("receive_message", msg);
// }

    // ================= QUESTION DETECT (PUBLIC ONLY) =================
    if (data.type !== "private" && isQuestion(data.text)) {
      const exists = await Question.findOne({
        room: data.room,
        text: data.text.trim(),
      });

      if (!exists) {
        const q = await Question.create({
          room: data.room,
          questionId: msg._id,
          text: data.text.trim(),
          user: data.user,
        });

        io.to(data.room).emit("new_question", q);
      }
    }

  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
  }
});





  // ================= DELETE MESSAGE =================

// socket.on("delete_message", async ({ messageId, username, room }) => {
//   try {
//     const msg = await Message.findById(messageId);
//     if (!msg) return;

//     const admins = ADMIN_USERS[room] || [];
//     const isAdmin = admins.includes(username);
//     const isSender = msg.user === username;

//     if (!isSender && !isAdmin) return;

//     await Message.deleteOne({ _id: messageId });
//     io.to(room).emit("message_deleted", { messageId });

//     await Question.findOneAndDelete({ questionId: messageId });
//     io.to(room).emit("question_deleted", messageId);

//   } catch (err) {
//     console.error("Delete error:", err);
//   }
// });

socket.on("delete_message", async ({ messageId, username, room }) => {
  try {
    const msg = await Message.findById(messageId);
    if (!msg) return;

    const user = await User.findOne({ username, room });

    const isAdmin = username === "Admin";
    const isSender = msg.user === username;

    if (!isSender && !isAdmin) return;

  await Message.deleteOne({ _id: messageId });

//  delete question also
await Question.findOneAndDelete({ questionId: messageId });

io.to(room).emit("message_deleted", { messageId });
io.to(room).emit("question_deleted", messageId);

  } catch (err) {
    console.error("Delete error:", err);
  }
});

// for mail

socket.on("check_prime_email", async ({ username, room }) => {
  const prime = await PrimeUser.findOne({ username });

  if (!prime) {
    socket.emit("need_prime_email");
  }
});

socket.on("save_prime_email", async ({ username, email, room }) => {
  await PrimeUser.findOneAndUpdate(
    { username },
    {
      $set: { email },
      $addToSet: { rooms: room }
    },
    { upsert: true, new: true }
  );

  socket.emit("prime_email_saved");
});


socket.on("prime_active", async ({ username }) => {
  await PrimeUser.findOneAndUpdate(
    { username },
    { lastSeenAt: new Date() }
  );
});
 // ==============prime update============

 socket.on("update_prime_users", async ({ room, primeUsers }) => {
  try {
    const updatedRoom = await Room.findOneAndUpdate(
      { name: room },
      { primeUsers },
      { new: true }
    );

    if (!updatedRoom) return;

    io.emit("prime_updated", {   //  GLOBAL EMIT
      room,
      primeUsers: updatedRoom.primeUsers,
    });

  } catch (err) {
    console.log(err);
  }
});

//===================creating socket===========

// socket.on("create_room", async (roomName) => {
//   const exists = await Room.findOne({ name: roomName });
//   if (exists) return;

//   await Room.create({ name: roomName, primeUsers: [] });

  
// });

socket.on("delete_room", async (roomName) => {
  await Room.deleteOne({ name: roomName });
  await Message.deleteMany({ room: roomName });
  await User.deleteMany({ room: roomName });

  io.emit("room_list_updated");
});



  // ================= READ MESSAGE =================
  socket.on("message_read", async ({ room, messageId, user }) => {
    const msg = await Message.findById(messageId);
    if (!msg) return;

    if (!msg.readBy.includes(user)) {
      msg.readBy.push(user);
      await msg.save();

      io.to(room).emit("read_update", {
        messageId,
        readBy: msg.readBy,
      });
    }
  });

  // ================= LEAVE ROOM =================
  socket.on("leave_room", ({ room, user }) => {
    socket.leave(room);

    if (activeUsers[room]?.[user] === socket.id) {
      delete activeUsers[room][user];
    }

    if (activeUsers[room] && Object.keys(activeUsers[room]).length === 0) {
      delete activeUsers[room];
    }

    console.log(`${user} left ${room}`);
  });

  // like message--------------------------------------------------//

socket.on("like_message", async ({ messageId, user }) => {
  try {
    const msg = await Message.findById(messageId);
    if (!msg) return;

    if (msg.likedBy.includes(user)) {
      msg.likedBy.pull(user); // unlike
    } else {
      msg.likedBy.push(user); // like
    }

    await msg.save();

    io.to(msg.room).emit("like_updated", {
      messageId,
      likedBy: msg.likedBy,
    });
  } catch (err) {
    console.error("LIKE ERROR:", err);
  }
});



  // ================= DISCONNECT =================
  socket.on("disconnect", () => {
    for (const room in activeUsers) {
      for (const user in activeUsers[room]) {
        if (activeUsers[room][user] === socket.id) {
          delete activeUsers[room][user];
        }
      }
      if (Object.keys(activeUsers[room]).length === 0) {
        delete activeUsers[room];
      }
    }
  });

 //---------========= editing msg--------//
socket.on("editMessage", async ({ messageId, newText }) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      messageId,
      {
        text: newText,
        edited: true,
      },
      { new: true } // IMPORTANT
    );

    if (!updated) {
      console.log(" Message not found for edit:", messageId);
      return;
    }

    io.to(updated.room).emit("messageEdited", updated);
  } catch (err) {
    console.error(" Edit message error:", err);
  }
});

});
app.use(express.json());



app.get("/rooms", async (req, res) => {
  const rooms = await Room.find().sort({ name: 1 });
  res.json(rooms);
});

app.post("/rooms", async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Room.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Room exists" });
    }

    const newRoom = await Room.create({
      name,
      primeUsers: [],
    });
    io.emit("room_added", newRoom);
    res.json(newRoom);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating room" });
  }
});

app.delete("/rooms/:name", async (req, res) => {
  const { name } = req.params;

  await Room.deleteOne({ name });
  await Message.deleteMany({ room: name });
  await User.deleteMany({ room: name });

  res.json({ success: true });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});