import { io } from "socket.io-client";

export const socket = io("https://query-flow-backend.onrender.com",{
  transports: ["websocket", "polling"],
});
