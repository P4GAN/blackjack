const express = require("express");
const app = express();

const port = 5000;

app.use(express.static("public"));

var server = app.listen(port, function() {
    console.log('Example app listening at http://localhost:${port}')
})

app.get("/", function (request, response) {
    response.sendFile(__dirname + "/public/app/index.html"); //when user requests webpage, send it
});

const io = require("socket.io")(server);

const path = require("path");

const players = require("./server/players");
const blackjack = require("./server/blackjack");


let serverPlayerList = {};
let deck = new blackjack.Deck();

let dealer = new players.Dealer();
let dealerHand = new players.Hand();
dealerHand.hit(deck.pickCard());
dealerHand.hit(deck.pickCard());
dealer.hands.push(dealerHand);
serverPlayerList["dealer"] = dealer;

let joinOrder = 1;

let currentPlayerIndex = 0;

io.on("connection", function(socket) {
    console.log(socket.id);

    let newPlayer = new players.Player("", 100, joinOrder);
    let newHand = new players.Hand();
    newHand.hit(deck.pickCard());
    newHand.hit(deck.pickCard());
    newPlayer.hands.push(newHand);
    serverPlayerList[socket.id] = newPlayer;

    joinOrder += 1;

    io.emit("serverUpdate", serverPlayerList);

    socket.on("gameStart", function() {
        io.emit("requestMove", )
    })

    socket.on("clientMessage", function(message) {
        console.log(message);
        io.emit("serverMessage", message);
    })

    socket.on("hit", function() {
        serverPlayerList[socket.id].hands[0].hit(deck.pickCard());
        io.emit("serverUpdate", serverPlayerList);

    })



    socket.on("draw", function(pos) {
        console.log("test");
        io.emit('serverDraw', pos);
    }) 
})