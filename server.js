import express from "express";
import mongoose from "mongoose";
import Messages from "./data/db_message.js";
import Pusher from "pusher";
import cors from "cors";
//fHyhvyqvgUlQRPA7
//mongodb+srv://admin:<password>@cluster0.rki8o.mongodb.net/<dbname>?retryWrites=true&w=majority
const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
  appId: "1067405",
  key: "a1d196191b1926dee4cb",
  secret: "28ed6b48f72162be924e",
  cluster: "ap1",
  encrypted: true,
});

app.use(express.json());

app.use(cors());

const sonnection_url =
  "mongodb+srv://admin:fHyhvyqvgUlQRPA7@cluster0.rki8o.mongodb.net/whatsappdb?retryWrites=true&w=majority";
mongoose.connect(sonnection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB connected");

  const msgCollection = db.collection("messages");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    console.log("Change occured");
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        by: messageDetails.by,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Rrroe triggering Pusher");
    }
  });
});

app.get("/", (req, res) => res.status(200).send("Hello world"));

app.get("/message/all", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/message/new", (req, res) => {
  const dbMessage = req.body;
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.listen(port, () => console.log(`Listening on localhost:${port}`));
