console.log("test");

const socket = io.connect()

const gameCanvas = document.getElementById("gameCanvas");
const context = gameCanvas.getContext("2d");

const messages = document.getElementById("messages");

let frameInterval = 20;

const gameInterval = setInterval(gameUpdate, frameInterval);

const suitList = ["clubs", "diamonds", "hearts", "spades"];
const rankList = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const suitUnicodes = {"clubs": "♣", "diamonds": "♦", "hearts": "♥", "spades": "♠"}
const suitColours = {"clubs": "dodgerBlue", "diamonds": "red", "hearts": "red", "spades": "dodgerBlue"}

const cardImages = {};

const cardHeight = 24;
const cardWidth = 48;

let playerList = [];
let playerIndex = 0;

const playerWidth = 4;
const playerHeight = 2;

const maxPlayerNumber = playerWidth * playerHeight;

const verticalOffset = 75;
const horizontalOffset = 4;

const handSeparationWidth = 65;
const cardSeparationDistance = 28;


function drawCard(card, x, y, bust) {
    context.beginPath();
    context.strokeStyle = suitColours[card.suit];
    context.shadowBlur = 50;
    context.shadowColor = suitColours[card.suit];
    context.lineWidth = 3;
    context.fillStyle = suitColours[card.suit];
    context.font = "24px Courier New";
    if (bust) {
        context.strokeStyle = "DimGrey";
        context.shadowColor = "DimGrey";
        context.fillStyle = "DimGrey";
    }
    context.rect(x, y, cardWidth, cardHeight)
    context.stroke();
    context.fillText(suitUnicodes[card.suit] + card.rank, x + 4, y + 18);
    context.shadowColor = 0; 
    context.shadowBlur = 0;     
}

function sendMessage() {
    let message = document.getElementById("message").value
    console.log(message);
    socket.emit("clientMessage", message);
}

function makeMove(move) {
    console.log(move);
    socket.emit(move);
}

socket.on("serverMessage", function(message) {
    let messageElement = document.createElement("li");
    messageElement.innerHTML = message;
    messages.appendChild(messageElement);
});

socket.on("serverUpdate", function(serverPlayerList, currentPlayerIndex) {
    playerList = serverPlayerList;
    playerIndex = currentPlayerIndex;
});

function drawPlayer(row, column, player) {
    context.fillStyle = "white";
    context.font = "20px Courier New";
    context.fillText("dsajknsk", 5 + column * gameCanvas.width / playerWidth, 20 + row * gameCanvas.height / playerHeight);
    context.fillText("Cash: $" + player.money, 5 + column * gameCanvas.width / playerWidth, 40 + row * gameCanvas.height / playerHeight);
    context.fillText("Bet: $" + player.bet, 5 + column * gameCanvas.width / playerWidth, 60 + row * gameCanvas.height / playerHeight);

    let drawX = horizontalOffset + column * gameCanvas.width / playerWidth;
    let drawY = verticalOffset + row * gameCanvas.height / playerHeight;
    for (let i = 0; i < player.hands.length; i++) {
        let handCards = player.hands[i].cards;
        for (let j = 0; j < handCards.length; j++) {
            let cardX = drawX + (i * handSeparationWidth);
            let cardY = drawY + (j * cardSeparationDistance);
            drawCard(handCards[j], cardX, cardY, player.hands[i].bust);
        }
        context.fillStyle = "white";
        context.font = "20px Courier New";

        let text = player.hands[i].sum;
        if (player.hands[i].sum > 21) {
            text = "Bust";
        }
        context.fillText(text, drawX + (i * handSeparationWidth), 16 + drawY + (player.hands[i].cards.length) * cardSeparationDistance)
    }

}

function gameUpdate() {
    context.fillStyle = "rgb(50, 50, 50)";
    context.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    for (let i = 0; i < playerList.length; i++) {
        
        let row = Math.floor(i / playerWidth);
        let column = i % playerWidth;
        drawPlayer(row, column, playerList[i]);

        context.strokeStyle = "black";
        context.beginPath();
        context.lineWidth = 4;
        context.rect(column * gameCanvas.width/playerWidth, 2 + row * gameCanvas.height/playerHeight, gameCanvas.width/playerWidth, gameCanvas.height/playerHeight)
        context.stroke();

    }

    let row = Math.floor(playerIndex / playerWidth);
    let column = playerIndex % playerWidth;

    context.strokeStyle = "yellow";
    context.beginPath();
    context.lineWidth = 4;
    context.rect(column * gameCanvas.width/playerWidth, 2 + row * gameCanvas.height/playerHeight, gameCanvas.width/playerWidth, gameCanvas.height/playerHeight)
    context.stroke();


    //let card = deck.deckList[0];
    //context.drawImage(card.getImage(), 0, 0, cardWidth, cardHeight);

}

/*
gameCanvas.addEventListener('click', function(event) {
    socket.emit("draw", [event.offsetX, event.offsetY]);
    console.log("skjks");

    context.beginPath();
    context.rect(event.offsetX, event.offsetY, 50, 50);
    context.fillStyle = "red";
    context.fill();

})

socket.on("serverDraw", function(pos) {
    console.log("te");
    console.log(pos);
    context.beginPath();
    context.rect(pos[0], pos[1], 50, 50);
    context.fillStyle = "red";
    context.fill();
})
*/