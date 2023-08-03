const mongoose = require("mongoose");
const Document = require("./Document.js");
mongoose
  .connect(
    "mongodb+srv://raghukiran1414:Raghu%40123@cluster0.m82pxwz.mongodb.net/google-docs-clone?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    }
  )
  .then(console.log("DB connected"));

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const defaultvalue = "";

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findorCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
      console.log(delta);
    });
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
  console.log("Connected");
});

async function findorCreateDocument(id) {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultvalue });
}
