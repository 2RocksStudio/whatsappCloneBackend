import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  message: String,
  name: String,
  by: String,
  timestamp: String,
  received: Boolean,
});

export default mongoose.model("messages", messageSchema);
