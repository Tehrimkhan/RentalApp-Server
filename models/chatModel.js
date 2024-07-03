import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      text: String,
      time: { type: Date, default: Date.now },
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
