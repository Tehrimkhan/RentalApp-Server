import express from 'express';
import { config } from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import Stripe from 'stripe';
import connectDB from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";

// dotenv config
config();

// Connect to database
connectDB();

// Stripe config
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: "http://localhost:19006", // Adjust this as needed
  credentials: true
}));
app.use(cookieParser());

// Routes import
import userRoutes from "./routes/userRoutes.js";
import bannerImageRoute from "./routes/bannerImageRoute.js";
import carpostRoutes from "./routes/carpostRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messagesRoutes from "./routes/messagesRoutes.js";
import rentedInfoRoute from "./routes/rentedInfoRoute.js";

// Use routes
app.use("/api", userRoutes);
app.use("/api/banner", bannerImageRoute);
app.use("/api/post/car", carpostRoutes);
app.use("/api/post", postRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/renter", rentedInfoRoute);

app.get("/", (req, res) => {
  res.send("Hello World with Middleware, DB, Routes, Cloudinary, Stripe, and Socket.io!");
});

// Socket.io setup
const userSocketMap = {};
const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("USER CONNECTED - " + socket.id);
  if (userId !== "undefined") userSocketMap[userId] = socket.id;

  socket.on("join_room", (data) => {
    console.log("USER WITH ID - ", socket.id, "JOIN ROOM - ", data.roomid);
  });

  socket.on("message", (data) => {
    console.log("Received message:", data);
    const receiverSocketId = getReceiverSocketId(data.receiverId);
    io.to(receiverSocketId).emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED - ", socket.id);
    delete userSocketMap[userId];
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});
