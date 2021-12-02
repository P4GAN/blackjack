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

const players = require("./serverModules/players");
const blackjack = require("./serverModules/blackjack");


let serverPlayerList = [];
let deck = new blackjack.Deck();

let currentPlayerIndex = 0;

io.on("connection", function(socket) {
    console.log(socket.id);

    socket.on('disconnect', function() { //when user disconnects send a message saying they left and remove them from playerList
        let playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)

        io.emit("serverMessage", serverPlayerList[playerIndex].name + " left")
        serverPlayerList.splice(playerIndex, 1);
      
    })

    socket.on("joinGame", function(name) { 
        if (serverPlayerList.findIndex(player => player.id == socket.id) == -1) {
            let newPlayer = new players.Player(name, 100, socket.id);
            let newHand = new players.Hand();
            newHand.hit(deck.pickCard());
            newHand.hit(deck.pickCard());
            newPlayer.hands.push(newHand);
            serverPlayerList.push(newPlayer);
            io.emit("serverMessage", name + " joined")
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex);
        }
    })



    io.emit("serverUpdate", serverPlayerList, currentPlayerIndex);

    socket.on("gameStart", function() {
        io.emit("requestMove")
    })

    socket.on("clientMessage", function(message) {
        console.log(message);
        io.emit("serverMessage", message);
    })

    socket.on("setBet", function(bet) {
        let player = serverPlayerList.find(player => player.id == socket.id)
        if (bet <= player.money) {
            player.bet = bet;
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex);
        }

    })

    socket.on("hit", function() {
        let playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex == currentPlayerIndex) {
            let currentPlayer = serverPlayerList[playerIndex];
            currentPlayer.hands[currentPlayer.currentHandIndex].hit(deck.pickCard());
            if (currentPlayer.hands[currentPlayer.currentHandIndex].bust && currentPlayer.hands[currentPlayer.currentHandIndex].cards.length < 7) {
                currentPlayer.currentHandIndex += 1
                if (currentPlayer.currentHandIndex >= currentPlayer.hands.length) {
                    currentPlayerIndex += 1;
                }
            }
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex);
        }
    })

    socket.on("stand", function() {
        let playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex == currentPlayerIndex) {
            let currentPlayer = serverPlayerList[playerIndex];
            currentPlayer.currentHandIndex += 1
            if (currentPlayer.currentHandIndex >= currentPlayer.hands.length) {
                currentPlayerIndex += 1;
            }
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex);
        }

    })

    socket.on("split", function() {
        let playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex == currentPlayerIndex) {
            let currentPlayer = serverPlayerList[playerIndex];
            if (currentPlayer.hands[currentPlayer.currentHandIndex].cards.length == 2) {
                if (currentPlayer.hands[currentPlayer.currentHandIndex][0] == currentPlayer.hands[currentPlayer.currentHandIndex][1]) {
                    splitHand = new players.Hand();
                    splitHand.hit(currentPlayer.hands[currentPlayer.currentHandIndex].cards.pop());
                    currentPlayer.hands.push(splitHand);
                }
            }
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex);
        }

    })

})

