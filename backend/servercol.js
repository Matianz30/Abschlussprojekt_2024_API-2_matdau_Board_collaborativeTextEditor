const Document = require("./document");
const mongoose = require("mongoose");
const socket = require("socket.io");

//const { addDocumentId, getDocumentIds } = require("./server");

function socketServer(passport, sessionMiddleware, server) {
    mongoose
        .connect("mongodb://matian:matian@localhost:8604/")
        .then(() => console.log("Connected!"));

    const io = socket(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    // support by https://socket.io/how-to/use-with-passport and cyril
    function onlyForHandshake(middleware) {
        return (req, res, next) => {
            const isHandshake = req._query.sid === undefined;
            if (isHandshake) {
                middleware(req, res, next);
            } else {
                next();
            }
        };
    }

    io.engine.use(onlyForHandshake(sessionMiddleware));
    io.engine.use(onlyForHandshake(passport.session()));
    io.engine.use(
        onlyForHandshake((req, res, next) => {
            /*
            if (req.user) {
              next();
            } else {
              res.writeHead(401);
              res.end();
            }*/
            next();
        })
    );

    const defaultValue = "";

    //help from ChatGPT to manage Documents
    io.on("connection", (socket) => {
        console.log("connected");
        socket.on("get-document", async (documentId) => {
            const document = await findOrCreateDocument(documentId);
            const user = socket.request.user;
            console.log(documentId);

            //addDocumentId(documentId); // Add documentId to the manager

            socket.join(documentId);
            socket.emit("load-document", document.data);
            socket.on("send-changes", (delta) => {
                socket.broadcast.to(documentId).emit("receive-changes", delta);
            });
            socket.on("save-document", async (data) => {
                await Document.findByIdAndUpdate(documentId, {data});
            });
        });
    });

    async function findOrCreateDocument(id) {
        if (id === null) return;
        const document = await Document.findById(id);
        if (document) return document;
        return await Document.create({_id: id, data: defaultValue});
    }
}

module.exports = socketServer;
