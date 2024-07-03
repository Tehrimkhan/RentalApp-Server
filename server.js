import express from "express";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import Stripe from "stripe";

import connectDB from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";

//dot env config
config();

//database connection
connectDB();

//STRIPE CONFIG
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//CLOUDINARY CONFIG
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

//rest object
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
//const io = new Server(httpServer, {});
//middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:19006",
    credentials: true,
  })
);
app.use(cookieParser());

//routes import
import userRoutes from "./routes/userRoutes.js";
import bannerImageRoute from "./routes/bannerImageRoute.js";
import carpostRoutes from "./routes/carpostRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messagesRoutes from "./routes/messagesRoutes.js";
import rentedInfoRoute from "./routes/rentedInfoRoute.js";
//route
app.use("/api", userRoutes);
app.use("/api/banner", bannerImageRoute);
app.use("/api/post/car", carpostRoutes);
app.use("/api/post", postRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/renter", rentedInfoRoute);

app.get("/", (req, res) => {
  return res.status(200).send("<h1>Welcome to node FlexShare</h1>");
});
const userSocketMap = {};
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("USER CONNECTED - " + socket.id);
  if (userId != "undefined") userSocketMap[userId] = socket.id;
  socket.on("join_room", (data) => {
    console.log("USER WITH ID - ", socket.id, "JOIN ROOM - ", data.roomid);
  });

  // socket.on("send_message", (data) => {
  //   console.log("MESSAGE RECIEVED - ", data);
  //   // io.to(data.clientSocketId).emit("receive_message", data.message);
  //   io.emit("receive_message", data);
  // });
  socket.on("message", (data) => {
    console.log("Received message:", data);

    // Assuming you have access to the recipient's socket ID
    const receiverSocketId = getReceiverSocketId(data.receiverId);
    //socket.broadcast.emit("message", data.message);
    // console.log(receiverSocketId);
    io.to(receiverSocketId).emit("message", data);
    // io.to(socket.id).emit("message", data);
  });
  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED - ", socket.id);
    delete userSocketMap[userId];
  });
});
//port
// const PORT = process.env.PORT || 8080;
// const PORT1 = 3001;
// //listen
// httpServer.listen(PORT1, () => {
//   console.log(`Socket IO Server running on ${PORT1} `);
// });

// app.listen(PORT, () => {
//   console.log(
//     `Server Running On PORT ${process.env.PORT} on ${process.env.NODE_ENV} mode`
//       .bgMagenta.white
//   );
// });

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`.bgMagenta.white);
});
