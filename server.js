import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import Stripe from 'stripe';

import connectDB from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

//dot env config
config();

// Check environment variables
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'CLOUDINARY_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_SECRET',
  'PORT'
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

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

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:19006',
    credentials: true,
  })
);
app.use(cookieParser());

//routes import
import userRoutes from './routes/userRoutes.js';
import bannerImageRoute from './routes/bannerImageRoute.js';
import carpostRoutes from './routes/carpostRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';
import rentedInfoRoute from './routes/rentedInfoRoute.js';

//route
app.use('/api', userRoutes);
app.use('/api/banner', bannerImageRoute);
app.use('/api/post/car', carpostRoutes);
app.use('/api/post', postRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/renter', rentedInfoRoute);

app.get('/', (req, res) => {
  return res.status(200).send('<h1>Welcome to node FlexShare</h1>');
});

const userSocketMap = {};
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('USER CONNECTED - ' + socket.id);
  if (userId != 'undefined') userSocketMap[userId] = socket.id;

  socket.on('join_room', (data) => {
    console.log('USER WITH ID - ', socket.id, 'JOIN ROOM - ', data.roomid);
  });

  socket.on('message', (data) => {
    console.log('Received message:', data);

    const receiverSocketId = getReceiverSocketId(data.receiverId);
    io.to(receiverSocketId).emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('USER DISCONNECTED - ', socket.id);
    delete userSocketMap[userId];
  });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`.bgMagenta.white);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
