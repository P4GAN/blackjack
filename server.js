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


let serverPlayerList = [];
let deck = new blackjack.Deck();

let currentPlayerIndex = 0;

io.on("connection", function(socket) {
    console.log(socket.id);

    let newPlayer = new players.Player("", 100, socket.id);
    let newHand = new players.Hand();
    newHand.hit(deck.pickCard());
    newHand.hit(deck.pickCard());
    newPlayer.hands.push(newHand);
    serverPlayerList.push(newPlayer);

    io.emit("serverUpdate", serverPlayerList, currentPlayerIndex);

    socket.on("gameStart", function() {
        io.emit("requestMove")
    })

    socket.on("clientMessage", function(message) {
        console.log(message);
        io.emit("serverMessage", message);
    })

    socket.on("hit", function() {
        playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex == currentPlayerIndex) {
            let currentPlayer = serverPlayerList[playerIndex];
            currentPlayer.hands[currentPlayer.currentHandIndex].hit(deck.pickCard());
            if (currentPlayer.hands[currentPlayer.currentHandIndex].bust && currentPlayer.hands[currentPlayer.currentHandIndex].cards.length < 7) {
                currentPlayer.currentHandIndex += 1
                if (currentPlayer.currentHandIndex >= currentPlayer.hands.length) {
                    currentPlayerIndex += 1;
                }
            }
            io.emit("serverUpdate", serverPlayerList);
        }
    })

    socket.on("stand", function() {
        playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex == currentPlayerIndex) {
            let currentPlayer = serverPlayerList[playerIndex];
            currentPlayer.currentHandIndex += 1
            if (currentPlayer.currentHandIndex >= currentPlayer.hands.length) {
                currentPlayerIndex += 1;
            }
            io.emit("serverUpdate", serverPlayerList);
        }

    })

    socket.on("split", function() {
        playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex == currentPlayerIndex) {
            let currentPlayer = serverPlayerList[playerIndex];
            if (currentPlayer.hands[currentPlayer.currentHandIndex].cards.length == 2) {
                if (currentPlayer.hands[currentPlayer.currentHandIndex][0] == currentPlayer.hands[currentPlayer.currentHandIndex][1]) {
                    splitHand = new players.Hand();
                    splitHand.hit(currentPlayer.hands[currentPlayer.currentHandIndex].cards.pop());
                    currentPlayer.hands.push(splitHand);
                }
            }
            io.emit("serverUpdate", serverPlayerList);
        }

    })

})
