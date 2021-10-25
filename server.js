const express = require("express");
const app = express();

const path = require("path");

const port = 5000;

app.use(express.static("public"));

var server = app.listen(port, function() {
    console.log('Example app listening at http://localhost:${port}')
})

const io = require("socket.io")(server);

app.get("/", function (request, response) {
    response.sendFile(path.join(__dirname, "public/app/index.html")); //when user requests webpage, send it
});



io.on("connection", function(socket) {
    console.log(socket.id)
})