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

let roundStarted = false;

let serverPlayerList = [];
let deck = new blackjack.Deck();

let currentPlayerIndex = 0;

let dealer = new players.Dealer();

function newTurn() {
    currentPlayerIndex += 1;
    if (currentPlayerIndex >= serverPlayerList.length) {
        currentPlayerIndex -= 1;

        while (dealer.hands[0].sum < 17) {
            dealer.hands[0].hit(deck.pickCard());
        }

        for (let i = 0; i < serverPlayerList.length; i++) {
            for (let j = 0; j < serverPlayerList[i].hands.length; j++) {
                if (serverPlayerList[i].hands[j].bust == false) {
                    if (dealer.hands[0].bust || serverPlayerList[i].hands[j].sum > dealer.hands[0].sum) {
                        serverPlayerList[i].money += 2 * serverPlayerList[i].bet;
                        if (serverPlayerList[i].hands[j].isBlackjack) {
                            serverPlayerList[i].money += Math.Floor(0.5 * serverPlayerList[i].bet);
                            io.emit("serverMessage", serverPlayerList[i].name + "has won $" + Math.Floor(1.5 * serverPlayerList[i].bet) + " from a Blackjack");
                        }
                        else {
                            io.emit("serverMessage", serverPlayerList[i].name + "has won $" + serverPlayerList[i].bet);
                        }
                    }
                    if (serverPlayerList[i].hands[j].sum == dealer.hands[0].sum) {
                        serverPlayerList[i].money += serverPlayerList[i].bet;
                        io.emit("serverMessage", serverPlayerList[i].name + "has tied and won nothing");

                    }
                }

            }
        }
        io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);

        roundStarted = false;

    }
}

io.on("connection", function(socket) {
    console.log(socket.id);

    socket.on('disconnect', function() { //when user disconnects send a message saying they left and remove them from playerList
        let playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex != -1) {

            io.emit("serverMessage", serverPlayerList[playerIndex].name + " left")
            serverPlayerList.splice(playerIndex, 1);
        }

        if (serverPlayerList.length == 0) {
            roundStarted = false;
        }
      
    })

    socket.on("joinGame", function(name) { 
        if (serverPlayerList.findIndex(player => player.id == socket.id) == -1 && roundStarted == false) {
            let newPlayer = new players.Player(name, 100, socket.id);
            serverPlayerList.push(newPlayer);
            io.emit("serverMessage", name + " joined")
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);
        }
    })



    io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);

    socket.on("startRound", function() {
        if (roundStarted == false) {
            let currentPlayerIndex = 0;
            roundStarted = true;
            for (let i = 0; i < serverPlayerList.length; i++) {
                let newHand = new players.Hand();
                newHand.hit(deck.pickCard());
                newHand.hit(deck.pickCard());
                serverPlayerList[i].hands = [newHand];
                serverPlayerList[i].currentHandIndex = 0;
                if (serverPlayerList[i].bet > serverPlayerList[i].money) {
                    serverPlayerList[i].bet = serverPlayerList[i].money;
                }
                serverPlayerList[i].money -= serverPlayerList[i].bet;

            }
            let dealerHand = new players.Hand();
            dealerHand.hit(deck.pickCard());
            dealerHand.hit(deck.pickCard());
            dealer.hands = [dealerHand];
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);
        }
    })

    socket.on("clientMessage", function(message) {
        console.log(message);
        let player = serverPlayerList.find(player => player.id == socket.id);
        let newMessage = player.name + ": " + message;
        io.emit("serverMessage", newMessage);
    })

    socket.on("setBet", function(bet) {
        let player = serverPlayerList.find(player => player.id == socket.id)
        if (Number.isInteger(bet) && roundStarted == false) {
            if (bet <= player.money) {
                player.bet = bet;
            }
            else {
                player.bet = player.money
            }
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);
        }

    })

    socket.on("hit", function() {
        let playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex == currentPlayerIndex && roundStarted) {
            let currentPlayer = serverPlayerList[playerIndex];
            if (currentPlayer.hands[currentPlayer.currentHandIndex].cards.length < 7) {
                currentPlayer.hands[currentPlayer.currentHandIndex].hit(deck.pickCard());
                if (currentPlayer.hands[currentPlayer.currentHandIndex].bust || currentPlayer.hands[currentPlayer.currentHandIndex].isBlackjack) {
                    currentPlayer.currentHandIndex += 1
                    if (currentPlayer.currentHandIndex >= currentPlayer.hands.length) {
                        newTurn();
                    }
                }
                io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);
            }
        }
    })

    socket.on("stand", function() {
        let playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex == currentPlayerIndex && roundStarted) {
            let currentPlayer = serverPlayerList[playerIndex];
            currentPlayer.currentHandIndex += 1
            if (currentPlayer.currentHandIndex >= currentPlayer.hands.length) {
                newTurn();
            }
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);
        }

    })

    socket.on("split", function() {
        let playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex == currentPlayerIndex && roundStarted) {
            let currentPlayer = serverPlayerList[playerIndex];
            if (currentPlayer.hands[currentPlayer.currentHandIndex].cards.length == 2) {
                if (currentPlayer.hands[currentPlayer.currentHandIndex].cards[0] == currentPlayer.hands[currentPlayer.currentHandIndex].cards[1]) {
                    if (serverPlayerList[i].bet <= serverPlayerList[i].money) {
                        currentPlayer.push(currentPlayer.hands[currentPlayer.currentHandIndex].split())
                        serverPlayerList[i].money -= serverPlayerList[i].bet;
                        io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);
                    }
                }
            }
        }

    })

})

