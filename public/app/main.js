console.log("test");

const socket = io.connect()

const gameCanvas = document.getElementById("gameCanvas");
const context = gameCanvas.getContext("2d");

const messages = document.getElementById("messages");

let frameInterval = 20;

const gameInterval = setInterval(gameUpdate, frameInterval);

const suitList = ["clubs", "diamonds", "hearts", "spades"];
const rankList = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const cardImages = {};

const cardHeight = 64;
const cardWidth = 49;

let playerList = {};

const playerWidth = 3;
const playerHeight = 4;

const maxPlayerNumber = playerWidth * playerHeight;

const handSeparationWidth = 25;
const cardSeparationDistance = 10;

for (let i = 0; i < suitList.length; i++) {
    for (let j = 0; j < rankList.length; j++) {
        let cardImage = new Image();
        let cardName = suitList[i] + rankList[j];
        cardImage.src = "/images/cards/" + cardName + ".png";
        cardImages[cardName] = cardImage;
    } 
}

function drawCard(card, x, y) {
    image = cardImages[card.suit + card.rank];
    context.drawImage(image, x, y, cardWidth, cardHeight);
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

socket.on("serverUpdate", function(serverPlayerList) {
    playerList = serverPlayerList;
});

function drawPlayer(row, column, player) {
    let drawX = column * gameCanvas.width / playerWidth;
    let drawY = row * gameCanvas.height / playerHeight;
    for (let i = 0; i < player.hands.length; i++) {
        let hand = player.hands[i].cards;
        for (let j = 0; j < hand.length; j++) {
            let cardX = drawX + (i * handSeparationWidth) + (j * cardSeparationDistance);
            let cardY = drawY + (j * cardSeparationDistance);
            drawCard(hand[j], cardX, cardY);
        }
    }

}

function gameUpdate() {
    context.fillStyle = "grey";
    context.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    let count = 0;
    for (playerID in playerList) {
        
        row = Math.floor(count / playerWidth);
        column = count % playerWidth;
        drawPlayer(row, column, playerList[playerID]);

        count += 1;
    }

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