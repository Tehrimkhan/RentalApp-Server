import express from "express";
import { isAuth } from "../middlewares/authMiddleware.js";
import {
  getMessageController,
  sendMessageController,
} from "../controllers/messageController.js";

const router = express.Router();

// Route to send a message
router.post("/send/:id", isAuth, sendMessageController);

router.get("/:id", isAuth, getMessageController);

// Export the router
export default router;
