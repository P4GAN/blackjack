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
const { parse } = require("path");

let roundStarted = false;

let serverPlayerList = [];
let deck = new blackjack.Deck();

let currentPlayerIndex = 0;

let dealer = new players.Dealer();
let dealerStandValue = 17;

let botCount = 0;

function newTurn() {
    currentPlayerIndex += 1;

    if (currentPlayerIndex >= serverPlayerList.length) {
        dealer.hidden = false;

        while (dealer.hands[0].sum < dealerStandValue) {
            dealer.hands[0].hit(deck.pickCard());
        }

        for (let i = 0; i < serverPlayerList.length; i++) {
            for (let j = 0; j < serverPlayerList[i].hands.length; j++) {
                if (serverPlayerList[i].hands[j].bust == false) {
                    if (dealer.hands[0].bust || serverPlayerList[i].hands[j].sum > dealer.hands[0].sum) {
                        serverPlayerList[i].money += 2 * serverPlayerList[i].bet;
                        if (serverPlayerList[i].hands[j].isBlackjack) {
                            serverPlayerList[i].money += Math.floor(0.5 * serverPlayerList[i].bet);
                            io.emit("serverMessage", serverPlayerList[i].name + " has won $" + Math.floor(1.5 * serverPlayerList[i].bet) + " from a Blackjack");
                        }
                        else {
                            io.emit("serverMessage", serverPlayerList[i].name + " has won $" + serverPlayerList[i].bet);
                        }
                    }
                    if (serverPlayerList[i].hands[j].sum == dealer.hands[0].sum) {
                        serverPlayerList[i].money += serverPlayerList[i].bet;
                        io.emit("serverMessage", serverPlayerList[i].name + " has tied and won nothing");
                    }
                }
            }
            if (serverPlayerList[i].money <= 0) {
                serverPlayerList.splice(playerIndex, 1);
                io.emit("serverMessage", serverPlayerList[i].name + " has been bankrupted and kicked, please rejoin to start with new money");

            }
        }

        io.emit("serverMessage", "Round Finished, click Start Round");

        roundStarted = false;

    }
    else if (serverPlayerList[currentPlayerIndex].bot == true) {

        while (serverPlayerList[currentPlayerIndex].hands[0].sum < serverPlayerList[currentPlayerIndex].standValue) {
            serverPlayerList[currentPlayerIndex].hands[0].hit(deck.pickCard());
        }
        newTurn();
    }
    io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);

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
            dealer.hands = [];
            roundStarted = false;
        }
        io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);

    })

    socket.on("changeDealerValue", function(standValue) {
        if (roundStarted == false && 12 <= parseInt(standValue) <= 21) {
            dealerStandValue = standValue;
        }
        io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);

    })

    socket.on("addBot", function(standValue) {
        if (roundStarted == false && serverPlayerList.length < 7 && 12 <= parseInt(standValue) <= 21) {
            io.emit("serverMessage", "Bot" + botCount + " Joined");
            botCount += 1;
            let newBot = new players.Bot(botCount, standValue);
            serverPlayerList.push(newBot);
        }
        io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);

    })

    socket.on("joinGame", function(name) { 
        if (serverPlayerList.findIndex(player => player.id == socket.id) == -1 && roundStarted == false && serverPlayerList.length < 7) {
            let newPlayer = new players.Player(name, 100, socket.id);
            serverPlayerList.push(newPlayer);
            io.emit("serverMessage", name + " joined")
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);
        }
    })



    io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);

    socket.on("startRound", function() {
        deck = new blackjack.Deck();

        if (roundStarted == false) {
            currentPlayerIndex = 0;
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
            dealer.hidden = true;
            let dealerHand = new players.Hand();
            dealerHand.hit(deck.pickCard());
            dealerHand.hit(deck.pickCard());
            dealer.hands = [dealerHand];
            io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);
        }
    })

    socket.on("clientMessage", function(message) {
        let player = serverPlayerList.find(player => player.id == socket.id);
        if (player) {
            let newMessage = player.name + ": " + message;
            io.emit("serverMessage", newMessage);
        }
    })

    socket.on("setBet", function(bet) {
        let player = serverPlayerList.find(player => player.id == socket.id)
        if (parseInt(bet) != NaN && roundStarted == false) {
            if (parseInt(bet) <= player.money) {
                player.bet = parseInt(bet);
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
            let currentHand = currentPlayer.hands[currentPlayer.currentHandIndex];
            if (currentHand.cards.length < 7) {
                currentHand.hit(deck.pickCard());
                if (currentHand.bust || currentHand.isBlackjack || currentHand.length >= 7) {
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
                if (currentPlayer.hands[currentPlayer.currentHandIndex].cards[0].rank == currentPlayer.hands[currentPlayer.currentHandIndex].cards[1].rank) {
                    if (currentPlayer.bet <= currentPlayer.money) {
                        currentPlayer.hands.push(currentPlayer.hands[currentPlayer.currentHandIndex].split())
                        currentPlayer.money -= currentPlayer.bet;
                        io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);
                    }
                }
            }
        }

    })

    socket.on("double", function() {
        let playerIndex = serverPlayerList.findIndex(player => player.id == socket.id)
        if (playerIndex == currentPlayerIndex && roundStarted) {
            let currentPlayer = serverPlayerList[playerIndex];
            let currentHand = currentPlayer.hands[currentPlayer.currentHandIndex];
            if (currentHand.cards.length < 7 && currentPlayer.bet <= currentPlayer.money) {
                currentPlayer.money -= currentPlayer.bet;
                currentPlayer.bet *= 2;
                currentHand.hit(deck.pickCard());
                currentPlayer.currentHandIndex += 1
                if (currentPlayer.currentHandIndex >= currentPlayer.hands.length) {
                    newTurn();
                }
                io.emit("serverUpdate", serverPlayerList, currentPlayerIndex, dealer);
            }
        }
    })

})

