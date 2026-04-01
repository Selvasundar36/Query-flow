import { useState } from "react";
import ChatRoom from "./components/ChatRoom";
import "./App.css";
import { useEffect } from "react";
import { socket } from "./socket";
import Login from "./components/Login";
import SplashScreen from "./components/SplashScreen";

/* simple fixed color generator */
const getColorByName = (name) => {
  const colors = ["#505050ff"];
  return colors[name.charCodeAt(0) % colors.length];
};

function App() {
  // ✅ KEEP ONLY ONE rooms STATE
  const [rooms, setRooms] = useState([
    // { name: "Java" },
    // { name: "HTML" },
    // { name: "CSS" },
    // { name: "Python" },
    // { name: "JavaScript" },
  ]);

  const [ROOM_USERS, setRoomUsers] = useState({
    // JAVA:[],
    // HTML: ["F", "G", "H", "I", "J"],
    // CSS: ["K", "L", "M", "N", "O"],
    // Python: ["P", "Q", "R", "S", "T"],
    // JavaScript: ["U", "V", "X", "Y", "Z"],
  });

  const [activeRoom, setActiveRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const openRoom = (room) => {
    setActiveRoom(room);
    setShowAdmin(false);
  };
  // profile image preview
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // limit 2MB
  if (file.size > 2 * 1024 * 1024) {
    alert("Image must be less than 2MB");
    return;
  }

  setSelectedFile(file);
  setPreviewImage(URL.createObjectURL(file));
};

//profile save
const handleSaveProfile = async () => {
  let imageUrl = user.picture;

  try {
    // Upload image if selected
    if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const uploadRes = await fetch(
        "https://query-flow-backend.onrender.com/api/profile/upload-profile",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        alert("Image upload failed");
        return;
      }

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.imageUrl;
    }

    // Update profile
    const updateRes = await fetch(
      "https://query-flow-backend.onrender.com/api/profile/update-profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,   // ✅ FIX HERE
          newName: newName || user.name,
          imageUrl: imageUrl,
        }),
      }
    );

    if (!updateRes.ok) {
      alert("Profile update failed");
      return;
    }

    const updatedUser = await updateRes.json();

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setEditName(false);
    setPreviewImage(null);
    setSelectedFile(null);

    alert("Profile updated successfully ✅");

  } catch (err) {
    console.error("Profile update failed:", err);
  }
};
useEffect(() => {
  const storedUser = localStorage.getItem("user");
  const storedAdmin = localStorage.getItem("isAdmin");

  if (storedUser && storedUser !== "undefined") {
    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error("Invalid user in localStorage");
      localStorage.removeItem("user");
    }
  }

  if (storedAdmin === "true") {
    setIsAdmin(true);
  }

  fetch("https://query-flow-backend.onrender.com/rooms")
    .then((res) => res.json())
    .then((data) => {
      setRooms(data);

      const formatted = {};
      data.forEach((room) => {
        formatted[room.name] = room.primeUsers || [];
      });

      setRoomUsers(formatted);
    });

  /* PRIME UPDATE */
  socket.on("prime_updated", ({ room, primeUsers }) => {
    setRoomUsers((prev) => ({
      ...prev,
      [room]: primeUsers,
    }));
  });

  /* ROOM ADDED */
 socket.on("room_added", (newRoom) => {
  setRooms((prev) => {
    const exists = prev.some((r) => r.name === newRoom.name);
    if (exists) return prev;
    return [...prev, newRoom];
  });

  setRoomUsers((prev) => ({
    ...prev,
    [newRoom.name]: newRoom.primeUsers || [],
  }));
});

  /* ROOM DELETED */
  socket.on("room_deleted", (roomName) => {
    setRooms((prev) => prev.filter((r) => r.name !== roomName));

    setRoomUsers((prev) => {
      const updated = { ...prev };
      delete updated[roomName];
      return updated;
    });
  });

  return () => {
    socket.off("prime_updated");
    socket.off("room_added");
    socket.off("room_deleted");
  };
}, []);




  /* ================= ADMIN PANEL ================= */
  const AdminPanel = () => {
    const [newRoom, setNewRoom] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [primeSlots, setPrimeSlots] = useState(["", "", "", "", ""]);

    const handleRoomSelect = (roomName) => {
      setSelectedRoom(roomName);

      const existingUsers = ROOM_USERS[roomName] || [];

      const filledSlots = [...existingUsers];
      while (filledSlots.length < 5) {
        filledSlots.push("");
      }

      setPrimeSlots(filledSlots.slice(0, 5));
    };

    const handlePrimeChange = (index, value) => {
      const updated = [...primeSlots];
      updated[index] = value;
      setPrimeSlots(updated);
    };

    const savePrimeUsers = () => {
  if (!selectedRoom) return;

  const cleaned = primeSlots.map((u) => u.trim());

  socket.emit("update_prime_users", {
    room: selectedRoom,
    primeUsers: cleaned,
  });
  alert(" New Prime User Update")
};


    const addRoom = async () => {
      if (!newRoom.trim()) return;

      try {
        const res = await fetch("https://query-flow-backend.onrender.com/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newRoom }),
        });

        if (!res.ok) {
          alert("Room already exists");
          return;
        }

        const created = await res.json();

        setRooms((prev) => [...prev, created]);
        setNewRoom("");
      } catch (err) {
        console.error("Add room error:", err);
      }
    };

    const deleteRoom = async (roomName) => {
      await fetch(`https://query-flow-backend.onrender.com/rooms/${roomName}`, {
        method: "DELETE",
      });

      setRooms((prev) => prev.filter((r) => r.name !== roomName));

      if (activeRoom === roomName) setActiveRoom(null);
    };

    return (
      <div className="admin-panel">
        <h2>Room Edit Panel</h2>

        <div className="admin-section">
          <h3>Add Room</h3>
          <input
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            placeholder="New Room Name"
          />
          <button onClick={addRoom}>Add</button>
        </div>

        <div className="admin-section">
          <h3>Delete Room</h3>
          {rooms.map((room) => (
            <div key={room.name} className="room-delete-item">
              <span>{room.name}</span>
              <button
                className="admin-delete-btn"
                onClick={() => deleteRoom(room.name)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="admin-section">
          <h3>Edit Prime Users</h3>

          <select
            value={selectedRoom}
            onChange={(e) => handleRoomSelect(e.target.value)}
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room.name} value={room.name}>
                {room.name}
              </option>
            ))}
          </select>

          {selectedRoom && (
            <div className="prime-edit-area">
              <h4>Prime Slots (5 Fixed)</h4>

              <div className="prime-slot-container">
                {primeSlots.map((user, index) => (
                  <input
                    key={index}
                    value={user}
                    placeholder={`Prime User ${index + 1}`}
                    onChange={(e) =>
                      handlePrimeChange(index, e.target.value)
                    }
                  />
                ))}
              </div>

              <button onClick={savePrimeUsers}>
                Save Prime Users
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
// Google Login
const handleGoogleSuccess = async (credentialResponse) => {
  console.log("TOKEN:", credentialResponse);

  try {
    const res = await fetch("https://query-flow-backend.onrender.com/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: credentialResponse.credential,
      }),
    });

    const data = await res.json();
    console.log("BACKEND RESPONSE:", data);

    if (!res.ok) {
      alert("Login failed");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);

  } catch (error) {
    console.log("Login Failed", error);
  }
};

// Admin Login
const handleAdminLogin = (email, password) => {
  const ADMIN_EMAIL = "admin@gmail.com";
  const ADMIN_PASSWORD = "12345";

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem("isAdmin", "true");
    setIsAdmin(true);
    setUser({ name: "Admin" });
  } else {
    alert("Invalid Admin Credentials");
  }
};
if (showSplash) {
  return <SplashScreen onFinish={() => setShowSplash(false)} />;
}
if (!user && !isAdmin) {
  return (
    
    <Login
      handleGoogleSuccess={handleGoogleSuccess}
      handleAdminLogin={handleAdminLogin}
    />
  );
}
  return (
    <div className="app-layout">
      <div className="header-user">
        <h1>Query Flow</h1>
          <div className="user-section">
  <img
  src={previewImage || user?.picture}
  alt="profile"
  className="user-avatar"
  onClick={() => setShowProfile(!showProfile)}
/>
  </div>
        {isAdmin && (
  <button className="ad-bt" onClick={() => setShowAdmin(!showAdmin)}>
    {showAdmin ? "Back" : "Room edit"}
  </button>
)}

<button
  className="logout-btn"
  onClick={() => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    setUser(null);
    setIsAdmin(false);
  }}
>
  Logout
</button>
      </div>

      <div className="main-content">
        <div className="sidebar">
          <div className="head">
            <h2 style={{ padding: 10 }}>Chat Rooms</h2>
          </div>

          <div className="rooms">
            {rooms.map((room) => (
              <div
                key={room.name}
                className={`room-btn ${
                  activeRoom === room.name ? "active" : ""
                }`}
                onClick={() => openRoom(room.name)}
              >
                <div className="room-top">
                  <span>{room.name}</span>
                </div>

                <div className="prime-users">
                  {(ROOM_USERS[room.name] || []).map((user) => (
                    <div
                      key={user}
                      className="prime"
                      style={{
                        backgroundColor: getColorByName(user),
                      }}
                    >
                      {user}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-area">
          {showAdmin ? (
            <AdminPanel />
          ) : activeRoom ? (
           <ChatRoom
  key={activeRoom}
  room={activeRoom}
  loggedUser={user}
/>
          ) : (
            <div className="empty-chat">
              Select a room to start chatting
            </div>
          )}
        </div>
      </div>

      {showProfile && (
  <div className="profile-dropdown">
    <div className="profile-info">

      {/* Profile Image */}
      <img
        src={previewImage || user?.picture}
        alt="DP"
        className="edit-preview"
      />

      {editName ? (
        <>
          {/* Upload Image */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* Edit Name */}
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new name"
          />

         <button onClick={handleSaveProfile}>
  Save Profile
</button>
        </>
      ) : (
        <>
         <h3>{user?.displayName || user?.name}</h3>
          <p>{user?.email}</p>

          <button
            onClick={() => {
              setNewName(user?.name);
              setEditName(true);
            }}
          >
            Edit Profile
          </button>
        </>
      )}
    </div>
  </div>
)}
    </div>
  );
}

export default App;
